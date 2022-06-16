import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { Invoice } from './invoice.entity';

import { InvoiceService } from './invoice.service';

@Controller('invoice')
export class InvoiceController {
  constructor(private invoiceServices: InvoiceService) { }

  @Get('person/:id')
  async findByPerson(@Param('id') personId: string): Promise<Invoice[]> {
    return await this.invoiceServices.findByPerson(+personId);
  }

  @Get('project/:id')
  async findOneByProject(@Param('id') projectId: string): Promise<Invoice> {
    return await this.invoiceServices.findOneByProject(+projectId);
  }

  @Post()
  async create(@Body() invoice: Invoice): Promise<Invoice> {
    return await this.invoiceServices.create(invoice);
  }

  @Get()
  async findAll(): Promise<Invoice[]> {
    return await this.invoiceServices.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Invoice> {
    return await this.invoiceServices.findOne(+id);
  }

  @Get('update/active/:id')
  async updateActive(@Param('id') invoiceId: string): Promise<Invoice> {
    return await this.invoiceServices.updateActive(+invoiceId);
  }

  @Put()
  async update(@Body() invoice: Invoice): Promise<Invoice> {
    return await this.invoiceServices.update(invoice);
  }
}
