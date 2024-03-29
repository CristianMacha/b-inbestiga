import {forwardRef, Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {InvoiceController} from './invoice.controller';
import {InvoiceRepository} from './invoice.repository';
import {InvoiceService} from './invoice.service';
import {PersonRoleModule} from "../person-role/person-role.module";
import {PermissionModule} from "../permission/permission.module";
import {FeeModule} from "../fee/fee.module";
import { PaymentModule } from '../payment/payment.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([InvoiceRepository]),
        PersonRoleModule,
        PermissionModule,
        forwardRef(() => FeeModule),
        PaymentModule,
    ],
    controllers: [InvoiceController],
    providers: [InvoiceService],
    exports: [InvoiceService],
})
export class InvoiceModule {
}
