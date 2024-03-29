import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentRepository } from "./payment.repository";
import { FeeModule } from "../fee/fee.module";
import { CoreModule } from 'src/core/core.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([PaymentRepository]),
        forwardRef(() => FeeModule),
        CoreModule,
    ],
    controllers: [PaymentController],
    providers: [PaymentService],
    exports: [PaymentService]
})
export class PaymentModule {
}
