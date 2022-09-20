import {forwardRef, Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {FeeController} from './fee.controller';
import {FeeRepository} from './fee.repository';
import {FeeService} from './fee.service';
import { PaymentModule } from '../payment/payment.module';
import { InvoiceModule } from '../invoice/invoice.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([FeeRepository]),
        forwardRef(() => PaymentModule),
        forwardRef(() => InvoiceModule),
    ],
    controllers: [FeeController],
    providers: [FeeService],
    exports: [FeeService],
})
export class FeeModule {
}
