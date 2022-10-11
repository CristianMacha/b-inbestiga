import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException, } from '@nestjs/common';
import { getConnection, Not } from 'typeorm';

import { Fee } from './fee.entity';
import { FeeRepository } from './fee.repository';
import { Person } from "../person/person.entity";
import { PaymentService } from '../payment/payment.service';
import { InvoiceStatusEnum } from '../../core/enums/invoice.enum';
import { EFeeStatus } from '../../core/enums/fee-status.enum';
import { PaymentConceptEnum, PaymentStatusEnum } from 'src/core/enums/payment.enum';
import { InvoiceService } from '../invoice/invoice.service';

@Injectable()
export class FeeService {
    constructor(
        private feeRepository: FeeRepository,
        @Inject(forwardRef(() => PaymentService))
        private paymentService: PaymentService,
        @Inject(forwardRef(() => InvoiceService))
        private invoiceService: InvoiceService,
    ) {
    }

    async create(invoiceId: number, fee: Fee): Promise<Fee> {
        const invoice = await this.invoiceService.findOne(invoiceId);
        if (!invoice) { throw new BadRequestException() }

        const newFee = this.feeRepository.create(fee);
        invoice.total += newFee.total;
        newFee.invoice = invoice;
        invoice.feesNumber += 1;
        if (invoice.status == InvoiceStatusEnum.PAID_OUT) {
            invoice.status = InvoiceStatusEnum.PARTIAL;
        }

        const connection = getConnection();
        return await connection.transaction('SERIALIZABLE', async manager => {
            await manager.save(invoice);
            return await manager.save(newFee);
        });
    }

    async findAll(): Promise<Fee[]> {
        return await this.feeRepository.find();
    }

    async findByProject(projectId: number): Promise<Fee[]> {
        return await this.feeRepository.findByProject(projectId);
    }

    async findOne(feeId: number): Promise<Fee> {
        return await this.feeRepository.findOne(feeId, {
            relations: ['invoice'],
        });
    }

    async updateActive(feeId: number): Promise<Fee> {
        const feeDb = await this.feeRepository.findOne(feeId, {
            relations: ['invoice']
        });
        if (!feeDb) { throw new NotFoundException('Fee not found.') }
        if (!feeDb.active) { throw new BadRequestException() }

        feeDb.active = false;

        const allPayments = await this.paymentService.findByConcept(feeDb.id, PaymentConceptEnum.FEE);
        const hasPaymentPendingOrVerify = allPayments.some((p) => p.status == PaymentStatusEnum.PROCESSING || p.status == PaymentStatusEnum.VERIFIED);
        if (hasPaymentPendingOrVerify) { throw new BadRequestException('No se puede eliminar esta cuota') }

        const connection = getConnection();
        return await connection.transaction('SERIALIZABLE', async manager => {
            const invoice = feeDb.invoice;
            invoice.total -= feeDb.total;
            invoice.feesNumber -= 1;

            await manager.save(invoice);
            return await manager.save(feeDb);
        })

    }

    async findByInvoice(invoiceId: number, personAuth: Person): Promise<Fee[]> {
        return await this.feeRepository.find({
            where: { invoice: { id: invoiceId } },
        });
    }

    async updateTotal(feeId: number, feeinfo: { paymentDate: Date, numberFee: number, total: number }): Promise<Fee> {
        const { numberFee, paymentDate, total } = feeinfo;

        const feeDb = await this.feeRepository.findOne(feeId, {
            relations: ['invoice'],
            where: {
                active: true,
            },
        });
        const invoice = feeDb.invoice;
        if (!feeDb) { throw new NotFoundException('Fee not found.') }

        const totalPaidOut = await this.paymentService.totalPaidOutFee(feeDb.id);

        const invoiceTotalPaidOut = await this.paymentService.findAllByInvoice(invoice.id);
        let totalInvoicePaidOut = 0;
        invoiceTotalPaidOut.forEach((pi) => {
            if (pi.status == PaymentStatusEnum.VERIFIED) {
                totalInvoicePaidOut += pi.amount;
            }
        })

        if (total < totalPaidOut) { throw new BadRequestException('El total debe ser mayor que el monto pagado. ') }
        if (total == totalPaidOut) {
            feeDb.status = EFeeStatus.PAID_OUT;

        }

        const connection = getConnection();
        const feeUpdated = await connection.transaction('SERIALIZABLE', async manager => {
            const isIncreasing = (total > feeDb.total);
            if (isIncreasing) {
                const amountExtra = total - feeDb.total;
                invoice.total += amountExtra;

                if (totalPaidOut > 0) {
                    invoice.status = InvoiceStatusEnum.PARTIAL;
                    invoice.feesPaidOut -= 1;
                    feeDb.status = EFeeStatus.PARTIAL;
                }

                feeDb.total += amountExtra;
            } else {
                if (totalInvoicePaidOut == invoice.total) {
                    invoice.status = InvoiceStatusEnum.PAID_OUT;
                }
                const amountDiscounted = feeDb.total - total;
                invoice.total -= amountDiscounted;
                feeDb.total -= amountDiscounted;
            }
            feeDb.paymentDate = paymentDate;
            feeDb.numberFee = numberFee;
            await manager.save(invoice);
            return await manager.save(feeDb);
        });

        return feeUpdated;
    }

    async findFeeOrderByNumberFee(invoiceId: number, status: EFeeStatus = EFeeStatus.PAID_OUT) {
        const fees = await this.feeRepository.find({
            where: {
                invoice: { id: invoiceId },
                active: true,
                status: Not(status)
            },
            order: { numberFee: 'ASC' }
        })

        return fees;
    }
}
