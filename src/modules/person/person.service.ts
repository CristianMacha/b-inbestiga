import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { getConnection } from 'typeorm';

import { NanoidService } from '../../helpers/nanoid.service';
import { BcryptService } from '../../helpers/bcrypt.service';
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
          if (roleDb) throw new NotFoundException('Role not found.');

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
      throw new BadRequestException(error);
    }
  }
}
