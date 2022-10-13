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

    async updateTotal(feeId: number, feeInfo: {paymentDate: Date, numberFee: number, total: number}) {
        const { numberFee, paymentDate, total } = feeInfo;
        const feeDb = await this.feeRepository.findOne(feeId, {
            relations: ['invoice'],
            where: { active: true }
        });
        const invoiceDb = feeDb.invoice;
        if(!feeDb) { throw new NotFoundException('Fee not found') }

        const paidOutFee = await this.paymentService.totalPaidOutFee(feeDb.id);
        const paymentsByInvoice = await this.paymentService.findAllByInvoice(invoiceDb.id);
        let paidOutInvoice = 0;
        const isIncreasing = feeDb.total < total;
        const amount = Math.abs(feeDb.total - total);

        paymentsByInvoice.forEach((pi) => {
            if(pi.status == PaymentStatusEnum.VERIFIED) {
                paidOutInvoice += pi.amount;
            }
        });

        if(total < paidOutFee) { throw new BadRequestException() }

        const connection = getConnection();
        return await connection.transaction('SERIALIZABLE', async manager => {
            if(isIncreasing) {
                invoiceDb.total += amount;
                feeDb.total += amount;
            } else {
                invoiceDb.total -= amount;
                feeDb.total -= amount;
            }
            
            if(feeDb.status == EFeeStatus.PENDING) {

            }

            if (feeDb.status == EFeeStatus.PARTIAL && !isIncreasing && (total == paidOutFee)) {
                feeDb.status = EFeeStatus.PAID_OUT;
                invoiceDb.feesPaidOut += 1;
            }

            if(feeDb.status == EFeeStatus.PAID_OUT) {
                feeDb.status = EFeeStatus.PARTIAL;
                invoiceDb.feesPaidOut -= 1;
                invoiceDb.status = InvoiceStatusEnum.PARTIAL;

                if(!isIncreasing && (paidOutFee == total)) {
                    feeDb.status = EFeeStatus.PAID_OUT;
                    invoiceDb.feesPaidOut += 1;
                    invoiceDb.status = InvoiceStatusEnum.PAID_OUT;
                }

            }

            feeDb.paymentDate = paymentDate;
            feeDb.numberFee = numberFee;

            await manager.save(invoiceDb);
            return await manager.save(feeDb);
        });
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
