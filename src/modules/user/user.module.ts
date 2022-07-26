import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {CoreModule} from '../../core/core.module';
import {UserController} from './user.controller';
import {UserRepository} from './user.repository';
import {UserService} from './user.service';
import {RoleModule} from "../role/role.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserRepository]),
        CoreModule,
        RoleModule,
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {
}
