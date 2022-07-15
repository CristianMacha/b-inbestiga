import {EntityRepository, Repository} from 'typeorm';
import {ForbiddenException} from "@nestjs/common";

import {Project} from './project.entity';
import {Person} from "../person/person.entity";
import {Role} from "../role/role.entity";
import {ERole} from "../../core/enums/role.enum";

@EntityRepository(Project)
export class ProjectRepository extends Repository<Project> {

    async findByPersonAndRoles(person: Person, roleId: number): Promise<Project[]> {
        const query = this.createQueryBuilder('project')
            .innerJoinAndSelect('project.personProjects', 'personProject')
            .innerJoinAndSelect('personProject.person', 'person')
            .where('project.deleted=false')

        switch (roleId) {
            case ERole.STUDENT:
                query.andWhere('person.id=:personId', {personId: person.id});
                break;

            case ERole.ADVISOR:
                query.andWhere('person.id=:personId', {personId: person.id});
                break;

            case ERole.ADMINISTRATOR:
                break;

            default:
                throw new ForbiddenException('No tiene permisos validos.');
        }

        query.orderBy('project.updatedAt', 'DESC');
        const result = await query.getMany();
        return result;

    }

    async findByPerson(personId: number): Promise<Project[]> {
        const query = this.createQueryBuilder('project')
            .innerJoinAndSelect('project.personProjects', 'personProject')
            .innerJoinAndSelect('personProject.person', 'person')
            .where('person.id=:personId', {personId})
            .andWhere('project.deleted=false');

        const result = await query.getMany();
        return result;
    }
}
