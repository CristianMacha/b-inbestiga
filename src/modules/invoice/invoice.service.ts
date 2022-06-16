import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Invoice } from './invoice.entity';
import { InvoiceRepository } from './invoice.repository';

@Injectable()
export class InvoiceService {
  constructor(private invoiceRepository: InvoiceRepository) { }

  async findByPerson(personId: number): Promise<Invoice[]> {
    try {
      const listInvoice = await this.invoiceRepository.findByPerson(personId);
      return listInvoice;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findOneByProject(projectId: number): Promise<Invoice> {
    try {
      const invoiceDb = await this.invoiceRepository.findOne({ where: { project: { id: projectId } } });
      if (!invoiceDb) { throw new NotFoundException('Invoice not found.'); }

      return invoiceDb;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

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
      const listInvoice = await this.invoiceRepository.find({
        relations: ['project']
      });
      return listInvoice;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findOne(invoiceId: number): Promise<Invoice> {
    try {
      const invoiceDb = await this.invoiceRepository.findOne(invoiceId, {
        relations: ['fees', 'project'],
      });
      return invoiceDb;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async updateActive(invoiceId: number): Promise<Invoice> {
    try {
      const invoiceDb = await this.invoiceRepository.findOne(invoiceId);
      if (!invoiceDb) { throw new NotFoundException('Invoice not found.'); }

      invoiceDb.active = !invoiceDb.active;
      const invoiceUpdated = await this.invoiceRepository.save(invoiceDb);
      return invoiceUpdated;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async update(invoice: Invoice): Promise<Invoice> {
    try {
      const invoiceDb = await this.invoiceRepository.preload(invoice);
      if (!invoiceDb) {
        throw new NotFoundException('Invoice not found.');
      }

      const invoiceUpdated = await this.invoiceRepository.save(invoiceDb);
      return invoiceUpdated;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
