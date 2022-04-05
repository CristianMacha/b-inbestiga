import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RequirementController } from './requirement.controller';
import { RequirementRepository } from './requirement.repository';
import { RequirementService } from './requirement.service';

@Module({
  imports: [TypeOrmModule.forFeature([RequirementRepository])],
  controllers: [RequirementController],
  providers: [RequirementService]
})
export class RequirementModule { }

