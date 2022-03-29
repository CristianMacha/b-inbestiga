import { Module } from '@nestjs/common';
import { PersonProjectController } from './person-project.controller';
import { PersonProjectService } from './person-project.service';

@Module({
  controllers: [PersonProjectController],
  providers: [PersonProjectService]
})
export class PersonProjectModule {}
