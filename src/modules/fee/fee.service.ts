import { BadRequestException, Injectable, NotFoundException, } from '@nestjs/common';
import { getConnection } from 'typeorm';

import { Fee } from './fee.entity';
import { FeeRepository } from './fee.repository';
import { Person } from "../person/person.entity";
import { PaymentService } from '../payment/payment.service';
import { InvoiceStatusEnum } from '../../core/enums/invoice.enum';
import { EFeeStatus } from '../../core/enums/fee-status.enum';

@Injectable()
export class FeeService {
    constructor(
        private feeRepository: FeeRepository,
        private paymentService: PaymentService,
    ) {
    }

    async create(fee: Fee): Promise<Fee> {
        const newFee = this.feeRepository.create(fee);
        return await this.feeRepository.save(newFee);
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
        const feeDb = await this.feeRepository.findOne(feeId);
        if (!feeDb) {
            throw new NotFoundException('Fee not found.');
        }

        feeDb.active = !feeDb.active;
        return await this.feeRepository.save(feeDb);
    }

    async findByInvoice(invoiceId: number, personAuth: Person): Promise<Fee[]> {
        return await this.feeRepository.find({
            where: { invoice: { id: invoiceId } },
        });
    }

    async updateTotal(feeId: number, total: number): Promise<Fee> {
        const feeDb = await this.feeRepository.findOne(feeId, {
            relations: ['invoice'],
            where: {
                active: true,
            },
        });
        if (!feeDb) { throw new NotFoundException('Fee not found.') }

        const totalPaidOut = await this.paymentService.totalPaidOutFee(feeDb.id);
        if (total <= totalPaidOut) { throw new BadRequestException('El total debe ser mayor que el monto pagado. ') }

        const invoice = feeDb.invoice;
        const connection = getConnection();
        const feeUpdated = await connection.transaction('SERIALIZABLE', async manager => {
            const isIncreasing = (total > feeDb.total);
            if (isIncreasing) {
                const amountExtra = total - feeDb.total;
                invoice.total += amountExtra;

                if(totalPaidOut > 0) {
                    invoice.status = InvoiceStatusEnum.PARTIAL;
                    feeDb.status = EFeeStatus.PARTIAL;
                }

                feeDb.total += amountExtra;
            } else {
                const amountDiscounted = feeDb.total - total;
                invoice.total -= amountDiscounted;
                feeDb.total -= amountDiscounted;
            }

            await manager.save(invoice);
            return await manager.save(feeDb);
        });

        return feeUpdated;
    }
}
