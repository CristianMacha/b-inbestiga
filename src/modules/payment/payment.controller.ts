import {Body, Controller, Get, Param, Post, Query, Req, UseGuards} from '@nestjs/common';
import {PaymentService} from "./payment.service";
import {PaymentCreateInterface} from "../../core/interfaces/payment.interface";
import {PaymentEntity} from "./payment.entity";
import {JwtAuthGuard} from "../../core/guards/jwt-auth.guard";
import {PaymentConceptEnum} from "../../core/enums/payment.enum";

@Controller('payment')
export class PaymentController {
    constructor(private paymentService: PaymentService) {
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
        return this.paymentService.createPaymentFee(paymentCreate, req.user.person);
    }

    @Post('approve/fee')
    approvePaymentFee(@Body() body: { paymentId: number, approve: boolean }): Promise<PaymentEntity> {
        return this.paymentService.approvePaymentFee(body.paymentId, body.approve);
    }
}
