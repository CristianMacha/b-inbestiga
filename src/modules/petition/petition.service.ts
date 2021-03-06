import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Petition } from './petition.entity';
import { PetitionRepository } from './petition.repository';

@Injectable()
export class PetitionService {
  constructor(private petitionRepository: PetitionRepository) {}

  async create(petition: Petition): Promise<Petition> {
    try {
      const newPetition = this.petitionRepository.create(petition);
      const newPetitionCreated = await this.petitionRepository.save(
        newPetition,
      );
      return newPetitionCreated;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAll(): Promise<Petition[]> {
    try {
      const listPetition = await this.petitionRepository.find({
        relations: ['category'],
        where: { active: true },
      });
      return listPetition;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findOne(petitionId: number): Promise<Petition> {
    try {
      const petitionDb = await this.petitionRepository.findOne(petitionId, {
        relations: ['category'],
      });
      return petitionDb;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async updateActive(petitionId: number): Promise<Petition> {
    try {
      const petitionDb = await this.petitionRepository.findOne(petitionId);
      if (!petitionDb) {
        throw new NotFoundException('Petition not found.');
      }

      petitionDb.active = !petitionDb.active;
      const petitionUpdated = await this.petitionRepository.save(petitionDb);
      return petitionUpdated;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async update(petition: Petition): Promise<Petition> {
    try {
      const petitionDb = await this.petitionRepository.preload(petition);
      if (!petitionDb) {
        throw new NotFoundException('Petition not found.');
      }

      const petitionUpdated = await this.petitionRepository.save(petitionDb);
      return petitionUpdated;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
