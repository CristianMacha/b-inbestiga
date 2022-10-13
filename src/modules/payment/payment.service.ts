import { BadGatewayException, BadRequestException, ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { getConnection, Not } from "typeorm";
import { PaymentRepository } from "./payment.repository";
import { PaymentEntity } from "./payment.entity";
import { PaymentCreateInterface } from "../../core/interfaces/payment.interface";
import { FeeService } from "../fee/fee.service";
import { Person } from "../person/person.entity";
import { PaymentConceptEnum, PaymentStatusEnum } from "../../core/enums/payment.enum";
import { EFeeStatus } from "../../core/enums/fee-status.enum";
import { InvoiceStatusEnum } from "../../core/enums/invoice.enum";
import { ERole } from "../../core/enums/role.enum";
import { NanoidService } from '../../core/helpers/nanoid.service';

@Injectable()
export class PaymentService {
    constructor(
        private paymentRepository: PaymentRepository,
        @Inject(forwardRef(() => FeeService))
        private feeServices: FeeService,
        private nanoid: NanoidService
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
            },
        });
    }

    async totalPaidOutFee(conceptId: number): Promise<number | null> {
        const totalPaidOut = await this.paymentRepository.totalPaidOutFee(conceptId);
        return totalPaidOut;
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

        if (fee.status == EFeeStatus.PAID_OUT) { throw new BadRequestException('No se puede registrar su pago.') }

        const newPayment = this.paymentRepository.create();
        newPayment.amount = paymentCreate.amount;
        newPayment.conceptId = fee.id;
        newPayment.concept = PaymentConceptEnum.FEE;
        newPayment.code = await this.nanoid.gPaymentCode();
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

        if (paymentDb.status != PaymentStatusEnum.PROCESSING) {
            throw new BadGatewayException(`Error al ${approve ? 'verificar' : 'rechazar'} pago.`);
        }
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
            if (approve) {
                const paymentsDb = await this.findFeePaymentsVerify(paymentDb.conceptId);
                const totalPaidOut = this.sumTotalPayments(paymentsDb);
                const newTotal = totalPaidOut + paymentDb.amount;
                if (feeDb.total <= newTotal) {
                    feeDb.status = EFeeStatus.PAID_OUT;
                } else {
                    feeDb.status = EFeeStatus.PARTIAL;
                }

                paymentDb.status = PaymentStatusEnum.VERIFIED;
            }

            const paymentsByInvoice = await this.paymentRepository.findByInvoice(invoiceDb.id);
            let totalPaidOut = 0;
            paymentsByInvoice.forEach((payment) => {
                if (payment.status == PaymentStatusEnum.VERIFIED && payment.active && !payment.deleted) {
                    totalPaidOut += payment.amount;
                }
            });

            if (invoiceDb.total <= (totalPaidOut + paymentDb.amount)) {
                invoiceDb.feesPaidOut += 1;
                invoiceDb.status = InvoiceStatusEnum.PAID_OUT;
            } else {
                invoiceDb.status = InvoiceStatusEnum.PARTIAL;
            }

            await manager.save(invoiceDb);
            await manager.save(feeDb);
            return await manager.save(paymentDb);
        });
    }

    async verifyPaymentFee(paymentId: number) {
        const payment = await this.paymentRepository.findOne(paymentId, {
            relations: ['person'],
            where: { active: true, deleted: false }
        });
        if (payment.status != PaymentStatusEnum.PROCESSING) { throw new BadRequestException() }

        const fee = await this.feeServices.findOne(payment.conceptId);
        if (!fee) { throw new NotFoundException('Resource not found.') }

        const { invoice } = fee;

        const connection = getConnection();
        return await connection.transaction('SERIALIZABLE', async manager => {
            const paymentsFeePaidOut = await this.findFeePaymentsVerify(payment.conceptId);
            const paymentTotalFeePaidOut = this.sumTotalPayments(paymentsFeePaidOut);
            const paymentInvoicePaidOut = await this.findAllByInvoice(invoice.id);

            const amount = payment.amount;
            const debtFee = fee.total - paymentTotalFeePaidOut;
            const debtInvoice = invoice.total - this.sumTotalPayments(paymentInvoicePaidOut);

            if (debtInvoice < amount) { throw new BadRequestException() }

            if (debtFee > amount) {
                fee.status = EFeeStatus.PARTIAL;
                payment.status = PaymentStatusEnum.VERIFIED;
                invoice.status = InvoiceStatusEnum.PARTIAL;

                await manager.save(invoice);
                await manager.save(fee);
                await manager.save(payment);
            }

            if (debtFee == amount) {
                fee.status = EFeeStatus.PAID_OUT;
                invoice.feesPaidOut += 1;
                invoice.status = InvoiceStatusEnum.PARTIAL;
                payment.status = PaymentStatusEnum.VERIFIED;

                await manager.save(fee);
                await manager.save(invoice);
                await manager.save(payment);
            }

            if (amount > debtFee) {
                fee.status = EFeeStatus.PAID_OUT;
                invoice.feesPaidOut += 1;
                invoice.status = InvoiceStatusEnum.PARTIAL;
                payment.status = PaymentStatusEnum.VERIFIED;
                payment.amount = debtFee;

                await manager.save(fee);
                await manager.save(invoice);
                await manager.save(payment);

                const feesToInvoice = await this.feeServices.findFeeOrderByNumberFee(invoice.id);
                const feesToInvoiceFiltered = feesToInvoice.filter((f) => f.id != fee.id);
                let remainingAmount = amount - debtFee;

                for await (const feeToInvoice of feesToInvoiceFiltered) {
                    const paymentsFeeToInvoicePaidOut = await this.findFeePaymentsVerify(feeToInvoice.id);
                    const paymentTotalFeeToInvoice = this.sumTotalPayments(paymentsFeeToInvoicePaidOut);
                    const debtFeeToInvoice = feeToInvoice.total - paymentTotalFeeToInvoice;

                    if (debtFeeToInvoice > remainingAmount) {
                        feeToInvoice.status = EFeeStatus.PARTIAL;
                        const newPayment = new PaymentEntity();
                        newPayment.status = PaymentStatusEnum.VERIFIED;
                        newPayment.amount = remainingAmount;
                        newPayment.code = payment.code;
                        newPayment.concept = PaymentConceptEnum.FEE;
                        newPayment.conceptId = feeToInvoice.id;
                        newPayment.paymentMethod = payment.paymentMethod;
                        newPayment.person = payment.person;

                        await manager.save(feeToInvoice);
                        await manager.save(newPayment);
                        break;
                    }

                    if (debtFeeToInvoice == remainingAmount) {
                        feeToInvoice.status = EFeeStatus.PAID_OUT;
                        const newPayment = new PaymentEntity();
                        newPayment.status = PaymentStatusEnum.VERIFIED;
                        newPayment.amount = remainingAmount;
                        newPayment.code = payment.code;
                        newPayment.concept = PaymentConceptEnum.FEE;
                        newPayment.conceptId = feeToInvoice.id;
                        newPayment.paymentMethod = payment.paymentMethod;
                        newPayment.person = payment.person;

                        invoice.feesPaidOut += 1;
                        invoice.status = InvoiceStatusEnum.PARTIAL;
                        await manager.save(invoice);
                        await manager.save(feeToInvoice);
                        await manager.save(newPayment);
                        break;
                    }

                    if (debtFeeToInvoice < remainingAmount) {
                        feeToInvoice.status = EFeeStatus.PAID_OUT;
                        const newPayment = new PaymentEntity();
                        newPayment.status = PaymentStatusEnum.VERIFIED;
                        newPayment.amount = debtFeeToInvoice;
                        newPayment.code = payment.code;
                        newPayment.concept = PaymentConceptEnum.FEE;
                        newPayment.conceptId = feeToInvoice.id;
                        newPayment.paymentMethod = payment.paymentMethod;
                        newPayment.person = payment.person;

                        invoice.feesPaidOut += 1;
                        invoice.status = InvoiceStatusEnum.PARTIAL;
                        await manager.save(invoice);
                        await manager.save(feeToInvoice);
                        await manager.save(newPayment);

                        remainingAmount = remainingAmount - debtFeeToInvoice;
                    }
                }

            }

            if (debtInvoice - amount == 0) {
                invoice.status = InvoiceStatusEnum.PAID_OUT;
                await manager.save(invoice);
            }

            return { paymentVerify: payment.amount }
        });
    }

    async refusePaymentFee(paymentId: number) {
        const payment = await this.paymentRepository.findOne(paymentId, {
            where: { active: true, deleted: false }
        });

        payment.status = PaymentStatusEnum.REFUSED;
        return await this.paymentRepository.save(payment);
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
            if (paymentDb.status == PaymentStatusEnum.PROCESSING) {
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

    async updatePaymentFee(paymentId: number, payment: PaymentEntity): Promise<PaymentEntity> {
        const paymentDb = await this.paymentRepository.findOne(paymentId, {
            where: {
                active: true,
                deleted: false,
            }
        });

        const fee = await this.feeServices.findOne(paymentDb.conceptId);
        const paidOutFee = await this.totalPaidOutFee(fee.id);
        const debtFee = fee.total - paidOutFee;
        const isIncreasing = paymentDb.amount < payment.amount;
        const amount = Math.abs(paymentDb.amount - payment.amount);
        
        if(paymentDb.amount == payment.amount) { throw new BadGatewayException() }

        const { invoice } = fee;
        const paymentsInvoice = await this.findAllByInvoice(invoice.id);
        let paidOutInvoice = 0;
        paymentsInvoice.forEach((pi) => {
            if(pi.status == PaymentStatusEnum.VERIFIED) {
                paidOutInvoice += pi.amount;
            }
        });

        if(payment.amount > fee.total) { throw new BadRequestException() }

        if (paymentDb.status == PaymentStatusEnum.PROCESSING) {
            paymentDb.amount = payment.amount;
        }

        if (paymentDb.status == PaymentStatusEnum.REFUSED) {
            paymentDb.amount = payment.amount;
            paymentDb.status = PaymentStatusEnum.PROCESSING;
        }

        if(paymentDb.status == PaymentStatusEnum.VERIFIED) {
            paymentDb.status = PaymentStatusEnum.VERIFIED;

            if (isIncreasing && (amount <= debtFee)) {
                paymentDb.amount += amount;                

                if (paidOutFee + amount == fee.total) {
                    fee.status = EFeeStatus.PAID_OUT;
                    invoice.feesPaidOut += 1;
                }

                if (paidOutInvoice + amount == invoice.total) {
                    invoice.status = InvoiceStatusEnum.PAID_OUT;
                }
            }

            if (!isIncreasing) {
                paymentDb.amount -= amount;
                fee.status = EFeeStatus.PARTIAL;
                invoice.status = InvoiceStatusEnum.PARTIAL;
                invoice.feesPaidOut -= 1;
            }

        }

        const connection = getConnection();
        return await connection.transaction('SERIALIZABLE', async manager => {
            await manager.save(invoice);
            await manager.save(fee);
            return await manager.save(paymentDb);
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
