import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonModule } from '../person/person.module';

import { ProjectController } from './project.controller';
import { ProjectRepository } from './project.repository';
import { ProjectService } from './project.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectRepository]),
    PersonModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectService]
})
export class ProjectModule { }
