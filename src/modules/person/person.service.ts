import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import {getConnection} from 'typeorm';

import {NanoidService} from '../../core/helpers/nanoid.service';
import {BcryptService} from '../../core/helpers/bcrypt.service';
import {PersonRepository} from './person.repository';
import {Person} from './person.entity';
import {RoleService} from '../role/role.service';
import {User} from '../user/user.entity';
import {PersonRole} from '../person-role/person-role.entity';
import {PersonRoleService} from '../person-role/person-role.service';

@Injectable()
export class PersonService {
    constructor(
        private personRepository: PersonRepository,
        private bcryptServices: BcryptService,
        private nanoidServices: NanoidService,
        private roleServices: RoleService,
        private personRoleService: PersonRoleService,
    ) {
    }

    async create(person: Person): Promise<Person> {
        try {
            const connection = getConnection();
            const personCreated = await connection.transaction(
                'SERIALIZABLE',
                async (manager) => {
                    let userPassword: string;
                    const userCode = await this.nanoidServices.gUserCode();

                    if (person.user.password.length > 6) {
                        userPassword = person.user.password;
                    } else {
                        userPassword = userCode;
                    }

                    const passwordHashed = await this.bcryptServices.encryptPassword(userPassword);

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
                },
            );

            return personCreated;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async findAll(): Promise<Person[]> {
        const listPerson = await this.personRepository.find({
            relations: ['personRoles', 'personRoles.role', 'user'],
            order: {updatedAt: 'DESC'}
        });
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

    async findOneByUser(userId: number): Promise<Person> {
        try {
            const personDb = await this.personRepository.findOne({
                relations: ['personRoles', 'personRoles.role', 'user'],
                where: {user: {id: userId}},
            });

            return personDb;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async findAllByRole(roleId: number): Promise<Person[]> {
        try {
            const listPerson = await this.personRepository.findAllByRole(roleId);
            return listPerson;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async updateActive(personId: number): Promise<Person> {
        try {
            const personDb = await this.personRepository.findOne(personId);
            if (!personDb) {
                throw new NotFoundException('Person not found');
            }

            personDb.active = !personDb.active;
            const personUpdated = await this.personRepository.save(personDb);
            return personUpdated;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async update(person: Person): Promise<Person> {
        try {
            const personDb = await this.personRepository.preload(person);
            if (!personDb) {
                throw new NotFoundException('Person not found.');
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
                    return updatePerson;
                },
            );

            const personUpdatedDb = await this.personRepository.findOne(
                personUpdated.id,
                {
                    relations: ['personRoles', 'personRoles.role', 'user'],
                },
            );

            return personUpdatedDb;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async findByCodeAndRole(code: string, roleId: number): Promise<Person> {
        try {
            const personDb = await this.personRepository.findByCodeAndRole(
                code,
                roleId,
            );
            return personDb;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }
}
