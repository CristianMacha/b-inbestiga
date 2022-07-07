import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Fee } from './fee.entity';
import { FeeRepository } from './fee.repository';

@Injectable()
export class FeeService {
  constructor(private feeRepository: FeeRepository) {}

  async create(fee: Fee): Promise<Fee> {
    try {
      const newFee = this.feeRepository.create(fee);
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
        where: { invoice: { id: invoiceId } },
      });
      return listFee;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
