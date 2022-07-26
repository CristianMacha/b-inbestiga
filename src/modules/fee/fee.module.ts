import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {FeeController} from './fee.controller';
import {FeeRepository} from './fee.repository';
import {FeeService} from './fee.service';
import {InvoiceModule} from "../invoice/invoice.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([FeeRepository]),
    ],
    controllers: [FeeController],
    providers: [FeeService],
})
export class FeeModule {
}
