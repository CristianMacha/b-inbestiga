import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PetitionController } from './petition.controller';
import { PetitionRepository } from './petition.repository';
import { PetitionService } from './petition.service';

@Module({
  imports: [TypeOrmModule.forFeature([PetitionRepository])],
  controllers: [PetitionController],
  providers: [PetitionService],
})
export class PetitionModule {}
