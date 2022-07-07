import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PersonRole } from './person-role.entity';
import { PersonRoleRepository } from './person-role.repository';

@Injectable()
export class PersonRoleService {
  constructor(private personRoleRepository: PersonRoleRepository) {}

  async findOne(personRoleId: number): Promise<PersonRole> {
    try {
      const personRoleDb = await this.personRoleRepository.findOne(
        personRoleId,
      );
      if (!personRoleDb) {
        throw new NotFoundException('Person Role not found.');
      }

      return personRoleDb;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
