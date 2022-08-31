import {EntityRepository, Repository} from "typeorm";
import {PaymentEntity} from "./payment.entity";
import {Fee} from "../fee/fee.entity";

@EntityRepository(PaymentEntity)
export class PaymentRepository extends Repository<PaymentEntity> {
    async findByInvoice(invoiceId: number): Promise<PaymentEntity[]> {
        const query = this.createQueryBuilder('payment')
            .leftJoin(Fee, 'fee', 'payment.conceptId=fee.id')
            .innerJoin('fee.invoice', 'invoice')
            .where('payment.active=true')
            .andWhere('payment.deleted=false')
            .andWhere('invoice.id=:invoiceId', {invoiceId});

        return await query.getMany();
    }
}
