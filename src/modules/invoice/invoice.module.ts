import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InvoiceController } from './invoice.controller';
import { InvoiceRepository } from './invoice.repository';
import { InvoiceService } from './invoice.service';

@Module({
  imports: [TypeOrmModule.forFeature([InvoiceRepository])],
  controllers: [InvoiceController],
  providers: [InvoiceService],
})
export class InvoiceModule {}
