import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { getConnection } from 'typeorm';

import { NanoidService } from '../../core/helpers/nanoid.service';
import { BcryptService } from '../../core/helpers/bcrypt.service';
import { PersonRepository } from './person.repository';
import { Person } from './person.entity';
import { RoleService } from '../role/role.service';
import { User } from '../user/user.entity';

@Injectable()
export class PersonService {
  constructor(
    private personRepository: PersonRepository,
    private bcryptServices: BcryptService,
    private nanoidServices: NanoidService,
    private roleServices: RoleService,
  ) {}

  async create(person: Person): Promise<Person> {
    try {
      const connection = getConnection();
      const personCreated = await connection.transaction(
        'SERIALIZABLE',
        async (manager) => {
          const userCode = await this.nanoidServices.gUserCode();
          const passwordHashed = await this.bcryptServices.encryptPassword(
            userCode,
          );

          const roleDb = await this.roleServices.findOne(person.user.role.id);
          if (!roleDb) throw new NotFoundException('Role not found.');

          const newUser = new User();
          newUser.email = person.user.email;
          newUser.password = passwordHashed;
          newUser.role = roleDb;
          const newUserCreated = await manager.save(newUser);

          const newPerson = new Person();
          newPerson.fullname = person.fullname;
          newPerson.code = userCode;
          newPerson.user = newUserCreated;
          const newPersonCreated = await manager.save(newPerson);
          return newPersonCreated;
        },
      );

      return personCreated;
    } catch (error) {
      console.log(error)
      throw new BadRequestException(error);
    }
  }

  async findAll(): Promise<Person[]> {
    const listPerson = await this.personRepository.find();
    return listPerson;
  }

  async findOne(personId: number): Promise<Person> {
    try {
      const personDb = await this.personRepository.findOne(personId);
      return personDb;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
