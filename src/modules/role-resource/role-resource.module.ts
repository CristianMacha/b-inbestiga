import {Module} from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";

import {RoleResourceController} from './role-resource.controller';
import {RoleResourceService} from './role-resource.service';
import {RoleResourceRepository} from "./role-resource.repository";

@Module({
    imports: [TypeOrmModule.forFeature([RoleResourceRepository])],
    controllers: [RoleResourceController],
    providers: [RoleResourceService]
})
export class RoleResourceModule {
}
