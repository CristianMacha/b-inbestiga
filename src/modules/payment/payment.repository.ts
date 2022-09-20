import { EntityRepository, Repository } from "typeorm";
import { PaymentEntity } from "./payment.entity";
import { Fee } from "../fee/fee.entity";
import { PaymentConceptEnum, PaymentStatusEnum } from "../../core/enums/payment.enum";

@EntityRepository(PaymentEntity)
export class PaymentRepository extends Repository<PaymentEntity> {
    async findByInvoice(invoiceId: number, paymentIgnore?: number): Promise<PaymentEntity[]> {
        const query = this.createQueryBuilder('payment')
            .leftJoin(Fee, 'fee', 'payment.conceptId=fee.id')
            .innerJoin('fee.invoice', 'invoice')
            .where('payment.active=true')
            .andWhere('payment.deleted=false')
            .andWhere('invoice.id=:invoiceId', { invoiceId });

        if (paymentIgnore) {
            query.andWhere('payment.id != :paymentIgnore', { paymentIgnore })
        }

        return await query.getMany();
    }

    /**
     * Listar pagos de una cuota ignorando algunos pagos
     * @param feeId
     * @param paymentIds
     */
    async findFeePaymentsVerifyWithPaymentsIgnore(feeId: number, paymentIds: number[]): Promise<PaymentEntity[]> {
        const query = this.createQueryBuilder('payment')
            .where('payment.conceptId=:feeId', { feeId })
            .andWhere('payment.concept=:concept', { concept: PaymentConceptEnum.FEE })
            .andWhere('payment.status=:status', { status: PaymentStatusEnum.VERIFIED });

        paymentIds.forEach((paymentId) => query.andWhere('payment.id=:paymentId', { paymentId }))

        return await query.getMany();
    }

    async totalPaidOutFee(conceptId: number): Promise<number | null> {
        const { total } = await this.createQueryBuilder('payment')
            .select('SUM(payment.amount)', 'total')
            .where('payment.active=true')
            .andWhere('payment.status=:status', { status: PaymentStatusEnum.VERIFIED })
            .andWhere('payment.deleted=false')
            .andWhere('payment.conceptId=:conceptId', { conceptId })
            .andWhere('payment.concept=:concept', { concept: PaymentConceptEnum.FEE })
            .getRawOne();

        return total;
    }
}
