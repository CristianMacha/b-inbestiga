import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PersonProjectController } from './person-project.controller';
import { PersonProjectRepository } from './person-project.repository';
import { PersonProjectService } from './person-project.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PersonProjectRepository])
  ],
  controllers: [PersonProjectController],
  providers: [PersonProjectService]
})
export class PersonProjectModule { }
