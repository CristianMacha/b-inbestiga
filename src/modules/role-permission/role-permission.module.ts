import {Module} from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";

import {RolePermissionController} from './role-permission.controller';
import {RolePermissionService} from './role-permission.service';
import {RolePermissionRepository} from "./role-permission.repository";

@Module({
    imports: [TypeOrmModule.forFeature([RolePermissionRepository])],
    controllers: [RolePermissionController],
    providers: [RolePermissionService]
})
export class RolePermissionModule {
}
