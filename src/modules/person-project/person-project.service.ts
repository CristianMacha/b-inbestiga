import { BadRequestException, Injectable } from '@nestjs/common';
import { PersonProject } from './person-project.entity';
import { PersonProjectRepository } from './person-project.repository';

@Injectable()
export class PersonProjectService {
  constructor(private personProjectRepository: PersonProjectRepository) {}

  async create(personProject: PersonProject): Promise<PersonProject> {
    try {
      const newPersonProject =
        this.personProjectRepository.create(personProject);
      const newPersonProjectCreated = await this.personProjectRepository.save(
        newPersonProject,
      );

      return newPersonProjectCreated;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAll(): Promise<PersonProject[]> {
    try {
      const listPersonProject = await this.personProjectRepository.find({
        relations: ['person', 'project'],
        where: { active: true },
      });

      return listPersonProject;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findOne(personProjectId: number): Promise<PersonProject> {
    try {
      const personProjectDb = await this.personProjectRepository.findOne(
        personProjectId,
        {
          relations: ['person', 'project'],
        },
      );
      return personProjectDb;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
