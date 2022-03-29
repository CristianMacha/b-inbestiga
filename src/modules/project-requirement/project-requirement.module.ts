import { Module } from '@nestjs/common';
import { ProjectRequirementController } from './project-requirement.controller';
import { ProjectRequirementService } from './project-requirement.service';

@Module({
  controllers: [ProjectRequirementController],
  providers: [ProjectRequirementService]
})
export class ProjectRequirementModule {}
