import {ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import {nanoid} from "nanoid/async";
import {PaymentRepository} from "./payment.repository";
import {PaymentEntity} from "./payment.entity";
import {PaymentCreateInterface} from "../../core/interfaces/payment.interface";
import {FeeService} from "../fee/fee.service";
import {Person} from "../person/person.entity";
import {PaymentConceptEnum, PaymentStatusEnum} from "../../core/enums/payment.enum";
import {getConnection, Not} from "typeorm";
import {EFeeStatus} from "../../core/enums/fee-status.enum";
import {InvoiceStatusEnum} from "../../core/enums/invoice.enum";
import {ERole} from "../../core/enums/role.enum";

@Injectable()
export class PaymentService {
    constructor(
        private paymentRepository: PaymentRepository,
        private feeServices: FeeService,
    ) {
    }

    /**
     * Find By Concept
     * @param conceptId
     * @param concept
     */
    async findByConcept(conceptId: number, concept: PaymentConceptEnum): Promise<PaymentEntity[]> {
        return await this.paymentRepository.find({
            where: {
                conceptId: conceptId,
                concept: concept,
                active: true,
                deleted: false,
            }
        });
    }

    /**
     * Create new Payment for Fee
     * @param paymentCreate
     * @param personAuth
     */
    async createPaymentFee(paymentCreate: PaymentCreateInterface, personAuth: Person): Promise<PaymentEntity> {
        const fee = await this.feeServices.findOne(paymentCreate.conceptId);
        if (!fee || !fee.active) {
            throw new NotFoundException('Fee not found')
        }

        const newPayment = this.paymentRepository.create();
        newPayment.amount = paymentCreate.amount;
        newPayment.conceptId = fee.id;
        newPayment.concept = PaymentConceptEnum.FEE;
        newPayment.code = await nanoid();
        newPayment.person = personAuth;
        newPayment.paymentMethod = paymentCreate.paymentMethod;

        return await this.paymentRepository.save(newPayment);
    }

    async approvePaymentFee(paymentId: number, approve: boolean): Promise<PaymentEntity> {
        const paymentDb = await this.paymentRepository.findOne(paymentId, {
            where: {
                active: true,
                deleted: false,
            }
        });
        if (!paymentDb) {
            throw new NotFoundException('Payment not found.');
        }

        const feeDb = await this.feeServices.findOne(paymentDb.conceptId);
        if (!feeDb) {
            throw new NotFoundException('Fee not found.');
        }

        const connection = getConnection();
        return await connection.transaction('SERIALIZABLE', async manager => {
            if (approve) {
                const paymentsDb = await this.findFeePaymentsVerify(paymentDb.conceptId);
                const totalPaidOut = this.sumTotalPayments(paymentsDb);
                if (feeDb.total <= totalPaidOut + paymentDb.amount) {
                    feeDb.status = EFeeStatus.PAID_OUT;
                } else {
                    feeDb.status = EFeeStatus.PARTIAL;
                }

                paymentDb.status = PaymentStatusEnum.VERIFIED;
            } else {
                paymentDb.status = PaymentStatusEnum.REFUSED;
            }

            const invoiceDb = feeDb.invoice;
            const paymentsByInvoice = await this.paymentRepository.findByInvoice(invoiceDb.id);
            let totalPaidOut = 0;
            paymentsByInvoice.forEach((payment) => {
                if (payment.status == PaymentStatusEnum.VERIFIED && payment.active && !payment.deleted) {
                    totalPaidOut += payment.amount;
                }
            });

            if (invoiceDb.total <= (totalPaidOut + paymentDb.amount)) {
                invoiceDb.status = InvoiceStatusEnum.PAID_OUT;
            } else {
                invoiceDb.status = InvoiceStatusEnum.PARTIAL;
            }

            await manager.save(invoiceDb);
            await manager.save(feeDb);
            return await manager.save(paymentDb);
        });
    }

    async findAllByInvoice(invoiceId: number, paymentIngnore?: number): Promise<PaymentEntity[]> {
        return await this.paymentRepository.findByInvoice(invoiceId);
    }

    async updateAmountFee(paymentId: number, amount: number, roleId: number): Promise<PaymentEntity> {
        if (roleId != ERole.ADMINISTRATOR) {
            throw new ForbiddenException();
        }

        const paymentDb = await this.paymentRepository.findOne(paymentId, {
            where: {
                status: Not(PaymentStatusEnum.REFUSED),
                active: true,
                deleted: false,
            }
        });
        if (!paymentDb) {
            throw new NotFoundException('Payment not found.');
        }

        const feeDb = await this.feeServices.findOne(paymentDb.conceptId);
        if (!feeDb) {
            throw new NotFoundException('Fee not found.');
        }
        const invoiceDb = feeDb.invoice;

        const connection = getConnection();
        return await connection.transaction('SERIALIZABLE', async manager => {
            paymentDb.amount = amount;
            if (paymentDb.status == PaymentStatusEnum.PENDING) {
                return await manager.save(paymentDb);
            }
            if (paymentDb.status == PaymentStatusEnum.VERIFIED) {
                const paymentsDb = await this.paymentRepository.findFeePaymentsVerifyWithPaymentsIgnore(feeDb.id, [paymentId]);
                let totalPaidOut = this.sumTotalPayments(paymentsDb);
                totalPaidOut += paymentDb.amount;
                if (feeDb.total <= totalPaidOut) {
                    feeDb.status = EFeeStatus.PAID_OUT;
                } else {
                    feeDb.status = EFeeStatus.PARTIAL;
                }

                const paymentsByInvoice = await this.findAllByInvoice(invoiceDb.id, paymentDb.id);
                let totalPaymentInvoice = this.sumTotalPayments(paymentsByInvoice);
                totalPaymentInvoice += paymentDb.amount;
                if (invoiceDb.total <= totalPaymentInvoice) {
                    invoiceDb.status = InvoiceStatusEnum.PAID_OUT;
                } else {
                    invoiceDb.status = InvoiceStatusEnum.PARTIAL;
                }

                await manager.save(invoiceDb);
                await manager.save(feeDb);
                return await manager.save(paymentDb);
            }
        });
    }

    async findFeePaymentsVerify(feeId: number): Promise<PaymentEntity[]> {
        return await this.paymentRepository.find({
            where: {
                conceptId: feeId,
                concept: PaymentConceptEnum.FEE,
                status: PaymentStatusEnum.VERIFIED,
            }
        });
    }

    private sumTotalPayments(payments: PaymentEntity[]): number {
        let totalPaidOut = 0;
        payments.forEach((payment) => {
            if (payment.status == PaymentStatusEnum.VERIFIED && payment.active && !payment.deleted) {
                totalPaidOut += payment.amount
            }
        });
        return totalPaidOut;
    }
}
