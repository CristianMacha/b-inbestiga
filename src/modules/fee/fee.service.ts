import {BadGatewayException, BadRequestException, Injectable, NotFoundException,} from '@nestjs/common';
import {getConnection} from "typeorm";
import {nanoid} from "nanoid/async";

import {Fee} from './fee.entity';
import {FeeRepository} from './fee.repository';
import {EFeeStatus} from "../../core/enums/fee-status.enum";
import {EStatusPay} from "../../core/enums/status-pay.enum";

@Injectable()
export class FeeService {
    constructor(private feeRepository: FeeRepository) {
    }

    async create(fee: Fee): Promise<Fee> {
        try {
            const newFee = this.feeRepository.create(fee);
            newFee.code = await nanoid();
            const feeCreated = await this.feeRepository.save(newFee);
            return feeCreated;
        } catch (error) {
            throw new BadGatewayException(error);
        }
    }

    async findAll(): Promise<Fee[]> {
        try {
            const listFee = await this.feeRepository.find({
                relations: ['person'],
            });
            return listFee;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async findOne(feeId: number): Promise<Fee> {
        try {
            const feeDb = await this.feeRepository.findOne(feeId, {
                relations: ['person'],
            });
            return feeDb;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async updateActive(feeId: number): Promise<Fee> {
        try {
            const feeDb = await this.feeRepository.findOne(feeId);
            if (!feeDb) {
                throw new NotFoundException('Fee not found.');
            }

            feeDb.active = !feeDb.active;
            const feeUpdated = await this.feeRepository.save(feeDb);
            return feeUpdated;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async update(fee: Fee): Promise<Fee> {
        try {
            const feeDb = await this.feeRepository.preload(fee);
            if (!feeDb) {
                throw new NotFoundException('Fee not found.');
            }

            feeDb.status = EFeeStatus.PROCESSING;
            const feeUpdated = await this.feeRepository.save(feeDb);
            return feeUpdated;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async findByInvoice(invoiceId: number): Promise<Fee[]> {
        try {
            const listFee = await this.feeRepository.find({
                relations: ['person'],
                where: {invoice: {id: invoiceId}},
            });
            return listFee;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async ValidateFee(feeId: number, fee: Fee): Promise<Fee> {
        try {
            const feeDb = await this.feeRepository.findOne(feeId, {
                relations: ['invoice']
            });
            if (!feeDb) {
                throw new NotFoundException('Fee not found.');
            }

            const connection = getConnection();
            const feeUpdated = await connection.transaction('SERIALIZABLE', async manager => {
                feeDb.status = fee.status;
                feeDb.observation = fee.observation;
                const feeDbUpdated = await manager.save(feeDb);

                let feesPaidOutByInvoice = await this.feeRepository.count({
                    where: {
                        invoice: {
                            id: feeDb.invoice.id,
                        },
                        status: EFeeStatus.PAID_OUT,
                        active: true,
                    }
                });
                (fee.status == EFeeStatus.PAID_OUT) && feesPaidOutByInvoice ++;
                if (feesPaidOutByInvoice == feeDb.invoice.feesNumber) {
                    feeDb.invoice.status = EStatusPay.PAID_OUT;
                    await manager.save(feeDb.invoice);
                }

                return feeDbUpdated;
            })
            return feeUpdated;
        } catch (e) {
            throw new BadRequestException(e);
        }
    }
}
