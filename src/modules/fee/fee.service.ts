import {
  BadGatewayException,
  BadRequestException,
  Injectable,
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
      const listFee = await this.feeRepository.find();
      return listFee;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findOne(feeId: number): Promise<Fee> {
    try {
      const feeDb = await this.feeRepository.findOne(feeId);
      return feeDb;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
