import {Injectable, NotFoundException,} from '@nestjs/common';

import {Fee} from './fee.entity';
import {FeeRepository} from './fee.repository';
import {Person} from "../person/person.entity";

@Injectable()
export class FeeService {
    constructor(private feeRepository: FeeRepository) {
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
            where: {invoice: {id: invoiceId}},
        });
    }
}
