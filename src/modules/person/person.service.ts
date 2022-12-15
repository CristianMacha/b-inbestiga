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
import { PersonRole } from '../person-role/person-role.entity';
import { PersonRoleService } from '../person-role/person-role.service';
import { ResponseListInterface } from '../../core/interfaces/response.interface';
import { PersonFilterInterface } from '../../core/interfaces/person.interface';
import { UserService } from '../user/user.service';

@Injectable()
export class PersonService {
  constructor(
    private personRepository: PersonRepository,
    private bcryptServices: BcryptService,
    private nanoidServices: NanoidService,
    private roleServices: RoleService,
    private personRoleService: PersonRoleService,
    private userService: UserService,
  ) {}

  async findByNameAndRole(
    nameValue: string,
    roleId: number,
  ): Promise<Person[]> {
    return await this.personRepository.findByNameAndRole(nameValue, roleId);
  }

  async create(person: Person): Promise<Person> {
    const emailExist = await this.userService.findByEmail(person.user.email);
    if (emailExist) {
      throw new BadRequestException('Email ya registrado');
    }
    const connection = getConnection();
    return await connection.transaction('SERIALIZABLE', async (manager) => {
      let userPassword: string;
      const userCode = await this.nanoidServices.gUserCode();

      if (person.user.password.length > 6) {
        userPassword = person.user.password;
      } else {
        userPassword = userCode;
      }

      const passwordHashed = await this.bcryptServices.encryptPassword(
        userPassword,
      );

      for await (const personRole of person.personRoles) {
        const roleDb = await this.roleServices.findOne(personRole.role.id);
        if (!roleDb) throw new NotFoundException('Role not found.');
      }

      const newUser = new User();
      newUser.email = person.user.email;
      newUser.password = passwordHashed;
      const newUserCreated = await manager.save(newUser);

      const newPerson = this.personRepository.create(person);
      newPerson.code = userCode;
      newPerson.user = newUserCreated;
      const newPersonCreated = await manager.save(newPerson);

      for await (const personRole of person.personRoles) {
        const newPersonRole = new PersonRole();
        newPersonRole.person = newPersonCreated;
        newPersonRole.role = personRole.role;
        await manager.save(newPersonRole);
      }

      return newPersonCreated;
    });
  }

  async findAll(
    filter: PersonFilterInterface,
  ): Promise<ResponseListInterface<Person[]>> {
    return await this.personRepository.findAll(filter);
  }

  async findOne(personId: number): Promise<Person> {
    return await this.personRepository.findOne(personId);
  }

  async findOneByUser(userId: number): Promise<Person> {
    return await this.personRepository.findOne({
      relations: ['personRoles', 'personRoles.role', 'user'],
      where: { user: { id: userId } },
    });
  }

  async findAllByRole(roleId: number): Promise<Person[]> {
    return await this.personRepository.findAllByRole(roleId);
  }

  async updateActive(personId: number): Promise<Person> {
    const personDb = await this.personRepository.findOne(personId);
    if (!personDb) {
      throw new NotFoundException('Person not found');
    }

    personDb.active = !personDb.active;
    return await this.personRepository.save(personDb);
  }

  async update(person: Person): Promise<Person> {
    const emailExist = await this.userService.findByEmail(person.user.email);
    if (emailExist) {
      throw new BadRequestException('Email ya registrado');
    }

    const personDb = await this.personRepository.preload(person);
    if (!personDb) {
      throw new NotFoundException('Person not found.');
    }

    const personDbWithUser = await this.personRepository.findOne(person.id, {
      relations: ['user'],
    });
    if (!personDbWithUser) {
      throw new BadRequestException();
    }
    const personRoleDb = await this.personRoleService.findOne(
      person.personRoles[0].id,
    );
    if (!personRoleDb) {
      throw new NotFoundException('Person role not found.');
    }
    personRoleDb.role = person.personRoles[0].role;

    const connection = getConnection();
    const personUpdated = await connection.transaction(
      'SERIALIZABLE',
      async (manager) => {
        const updatePerson = await manager.save(personDb);
        await manager.save(personRoleDb);

        for await (const personRole of person.personRoles) {
          const newPersonRole = new PersonRole();
          newPersonRole.id = personRole.id;
          newPersonRole.role = personRole.role;
          newPersonRole.active = personRole.active;
          newPersonRole.person = updatePerson;

          await manager.save(newPersonRole);
        }

        const user = personDbWithUser.user;
        user.email = person.user.email;
        await manager.save(user);

        return updatePerson;
      },
    );

    return await this.personRepository.findOne(personUpdated.id, {
      relations: ['personRoles', 'personRoles.role', 'user'],
    });
  }

  async findByCodeAndRole(code: string, roleId: number): Promise<Person> {
    return await this.personRepository.findByCodeAndRole(code, roleId);
  }
}
