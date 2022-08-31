import { EntityRepository, Repository } from 'typeorm';
import { Fee } from './fee.entity';

@EntityRepository(Fee)
export class FeeRepository extends Repository<Fee> {
    async findByInvoiceAnd(invoiceId: number, personAuth) {}
}
