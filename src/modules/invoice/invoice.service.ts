import { BadRequestException, Injectable } from '@nestjs/common';

import { Invoice } from './invoice.entity';
import { InvoiceRepository } from './invoice.repository';

@Injectable()
export class InvoiceService {
  constructor(private invoiceRepository: InvoiceRepository) {}

  async create(invoice: Invoice): Promise<Invoice> {
    try {
      const newInvoice = this.invoiceRepository.create(invoice);
      const invoiceCreated = await this.invoiceRepository.save(newInvoice);
      return invoiceCreated;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAll(): Promise<Invoice[]> {
    try {
      const listInvoice = await this.invoiceRepository.find();
      return listInvoice;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findOne(invoiceId: number): Promise<Invoice> {
    try {
      const invoiceDb = await this.invoiceRepository.findOne(invoiceId);
      return invoiceDb;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
