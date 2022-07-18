import {EntityRepository, Repository} from 'typeorm';
import {ForbiddenException} from "@nestjs/common";

import {Project} from './project.entity';
import {Person} from "../person/person.entity";
import {ERole} from "../../core/enums/role.enum";
import {Permission} from "../permission/permission.entity";
import {EPermission} from "../../core/enums/permission.enum";

@EntityRepository(Project)
export class ProjectRepository extends Repository<Project> {

    async findByPersonAndRoles(person: Person, permissions: Permission[]): Promise<Project[]> {
        const query = this.createQueryBuilder('project')
            .innerJoinAndSelect('project.personProjects', 'personProject')
            .innerJoinAndSelect('personProject.person', 'person')
            .where('project.deleted=false')

        permissions.forEach((permission) => {
            switch (permission.id) {
                case EPermission.LIST_ALL_PROJECTS:
                    break;

                case EPermission.LIST_YOUR_PROJECTS:
                    query.andWhere('person.id=:personId', {personId: person.id});
                    break;
            }
        });

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
