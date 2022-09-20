import { Body, Controller, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { PaymentService } from "./payment.service";
import { PaymentCreateInterface } from "../../core/interfaces/payment.interface";
import { PaymentEntity } from "./payment.entity";
import { JwtAuthGuard } from "../../core/guards/jwt-auth.guard";
import { PaymentConceptEnum } from "../../core/enums/payment.enum";

@Controller('payment')
export class PaymentController {
    constructor(private paymentService: PaymentService) {
    }

    @Get('total/fee/:id')
    async findTotalPaidOutFee(@Param('id') feeId: number): Promise<{ total: number | null }> {
        const totalPaidOut = await this.paymentService.totalPaidOutFee(feeId);
        return { total: totalPaidOut };
    }

    @Get('invoice/:id')
    findByInvoice(@Param('id') invoiceId: string): Promise<PaymentEntity[]> {
        return this.paymentService.findAllByInvoice(+invoiceId);
    }

    @Get('concept')
    findByConcept(@Query() query: { conceptId: number, concept: PaymentConceptEnum }): Promise<PaymentEntity[]> {
        return this.paymentService.findByConcept(+query.conceptId, query.concept);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    createPayment(@Body() paymentCreate: PaymentCreateInterface, @Req() req): Promise<PaymentEntity> {
        return this.paymentService.createPaymentFee(paymentCreate, req.user);
    }

    @Post('approve/fee')
    approvePaymentFee(@Body() body: { paymentId: number, approve: boolean }): Promise<PaymentEntity> {
        return this.paymentService.approvePaymentFee(body.paymentId, body.approve);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('amount/fee')
    updateAmountFee(@Body() body: { paymentId: number, amount: number }, @Req() req): Promise<PaymentEntity> {
        return this.paymentService.updateAmountFee(body.paymentId, body.amount, req.headers.data)
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    update(@Param('id') paymentId: string, @Body() payment: PaymentEntity): Promise<PaymentEntity> {
        return this.paymentService.update(+paymentId, payment);
    }
}
