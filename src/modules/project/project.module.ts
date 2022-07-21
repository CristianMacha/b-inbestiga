import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {InvoiceModule} from '../invoice/invoice.module';
import {PersonProjectModule} from '../person-project/person-project.module';
import {PersonModule} from '../person/person.module';
import {ProjectController} from './project.controller';
import {ProjectRepository} from './project.repository';
import {ProjectService} from './project.service';
import {PersonRoleModule} from "../person-role/person-role.module";
import {PermissionModule} from "../permission/permission.module";
import {CoreModule} from "../../core/core.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([ProjectRepository]),
        PersonModule,
        InvoiceModule,
        PersonProjectModule,
        PersonRoleModule,
        PermissionModule,
        CoreModule,
    ],
    controllers: [ProjectController],
    providers: [ProjectService],
})
export class ProjectModule {
}
