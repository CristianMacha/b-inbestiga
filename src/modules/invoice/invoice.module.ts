import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {InvoiceController} from './invoice.controller';
import {InvoiceRepository} from './invoice.repository';
import {InvoiceService} from './invoice.service';
import {PersonRoleModule} from "../person-role/person-role.module";
import {PermissionModule} from "../permission/permission.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([InvoiceRepository]),
        PersonRoleModule,
        PermissionModule,
    ],
    controllers: [InvoiceController],
    providers: [InvoiceService],
    exports: [InvoiceService],
})
export class InvoiceModule {
}
