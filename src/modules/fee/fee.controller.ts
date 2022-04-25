import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { Fee } from './fee.entity';
import { FeeService } from './fee.service';

@Controller('fee')
export class FeeController {
  constructor(private feeServices: FeeService) {}

  @Post()
  async create(@Body() fee: Fee): Promise<Fee> {
    return await this.feeServices.create(fee);
  }

  @Get()
  async findAll(): Promise<Fee[]> {
    return await this.feeServices.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Fee> {
    return await this.feeServices.findOne(+id);
  }
}
