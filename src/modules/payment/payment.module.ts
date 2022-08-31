import {Module} from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {PaymentService} from './payment.service';
import {PaymentController} from './payment.controller';
import {PaymentRepository} from "./payment.repository";
import {FeeModule} from "../fee/fee.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([PaymentRepository]),
        FeeModule,
    ],
    controllers: [PaymentController],
    providers: [PaymentService]
})
export class PaymentModule {
}
