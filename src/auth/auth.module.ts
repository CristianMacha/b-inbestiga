import {Module} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';

import {CoreModule} from '../core/core.module';
import {UserModule} from '../modules/user/user.module';
import {AuthController} from './auth.controller';
import {AuthProvider} from './auth.provider';
import {AuthService} from './auth.service';
import {JwtStrategy} from './passport/jwt.strategy';
import {PersonModule} from "../modules/person/person.module";
import {ResourceModule} from "../modules/resource/resource.module";
import {PersonRoleModule} from "../modules/person-role/person-role.module";
import {RoleModule} from "../modules/role/role.module";

@Module({
    imports: [
        AuthProvider,
        UserModule,
        PersonModule,
        CoreModule,
        ResourceModule,
        PersonRoleModule,
        RoleModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [JwtStrategy],
})
export class AuthModule {
    constructor(private config: ConfigService) {
    }
}
