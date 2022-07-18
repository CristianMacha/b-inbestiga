import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {CoreModule} from '../../core/core.module';
import {PersonRoleModule} from '../person-role/person-role.module';
import {RoleModule} from '../role/role.module';
import {PersonController} from './person.controller';
import {PersonRepository} from './person.repository';
import {PersonService} from './person.service';
import {UserModule} from "../user/user.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([PersonRepository]),
        CoreModule,
        RoleModule,
        PersonRoleModule,
        UserModule,
    ],
    controllers: [PersonController],
    providers: [PersonService],
    exports: [PersonService],
})
export class PersonModule {
}
