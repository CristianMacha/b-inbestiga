import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PersonRoleController } from './person-role.controller';
import { PersonRoleRepository } from './person-role.repository';
import { PersonRoleService } from './person-role.service';

@Module({
  imports: [TypeOrmModule.forFeature([PersonRoleRepository])],
  controllers: [PersonRoleController],
  providers: [PersonRoleService],
  exports: [PersonRoleService]
})
export class PersonRoleModule { }
