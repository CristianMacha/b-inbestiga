import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import {PersonRole} from './person-role.entity';
import {PersonRoleRepository} from './person-role.repository';
import {Person} from "../person/person.entity";

@Injectable()
export class PersonRoleService {
    constructor(private personRoleRepository: PersonRoleRepository) {
    }

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

    async findByPerson(personAuth: Person): Promise<PersonRole[]> {
        try {
            const personRoles = await this.personRoleRepository.find({
                relations: ['role'],
                where: {
                    active: true,
                    person: {id: personAuth.id},
                }
            });

            return personRoles;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async findByPersonAndRole(personId: number, roleId: number): Promise<PersonRole> {
        try {
            const personRoleDb = await this.personRoleRepository.findOne({
                where: {
                    person: {id: personId},
                    role: {id: roleId},
                    active: true,
                }
            });
            return personRoleDb;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }
}
