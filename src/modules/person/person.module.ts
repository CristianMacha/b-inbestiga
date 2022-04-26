import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HelpersModule } from '../../core/helpers/helpers.module';
import { RoleModule } from '../role/role.module';
import { PersonController } from './person.controller';
import { PersonRepository } from './person.repository';
import { PersonService } from './person.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PersonRepository]),
    HelpersModule,
    RoleModule,
  ],
  controllers: [PersonController],
  providers: [PersonService],
  exports: [PersonService],
})
export class PersonModule {}
