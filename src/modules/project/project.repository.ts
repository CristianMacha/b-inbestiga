import {EntityRepository, Repository} from 'typeorm';

import {Project} from './project.entity';
import {Person} from "../person/person.entity";
import {Permission} from "../permission/permission.entity";
import {EProjectStatus} from "../../core/enums/project.enum";
import {ProjectFilterInterface} from "../../core/interfaces/project-filter.interface";
import {CPermission} from "../../core/enums/permission.enum";

@EntityRepository(Project)
export class ProjectRepository extends Repository<Project> {

    /**
     * Get list by person and role
     * @param person model
     * @param permissions model[]
     * @param filters interface
     */
    async findByPersonAndRoles(person: Person, permissions: Permission[], filters?: ProjectFilterInterface): Promise<Project[]> {
        const query = this.createQueryBuilder('project')
            .innerJoinAndSelect('project.personProjects', 'personProject')
            .innerJoinAndSelect('personProject.person', 'person')
            .where('project.deleted=false')

        switch (filters.status) {
            case EProjectStatus.PENDING:
                query.andWhere('project.status=:projectStatus', {projectStatus: EProjectStatus.PENDING});
                break;

            case EProjectStatus.COMPLETED:
                query.andWhere('project.status=:projectStatus', {projectStatus: EProjectStatus.COMPLETED});
                break;

            default:

                break;
        }

        permissions.forEach((permission) => {
            switch (permission.id) {
                case CPermission.P_PROJECT.LIST_ALL:
                    break;

                case CPermission.P_PROJECT.LIST_BY_PERSON:
                    query.andWhere('person.id=:personId', {personId: person.id});
                    break;

                default:
                    break;
            }
        });

        query.orderBy('project.updatedAt', 'DESC');
        return await query.getMany();
    }

    async findByPerson(personId: number): Promise<Project[]> {
        const query = this.createQueryBuilder('project')
            .innerJoin('project.personProjects', 'personProject')
            .innerJoin('personProject.person', 'person')
            .where('person.id=:personId', {personId})
            .andWhere('project.deleted=false');

        return await query.getMany();
    }
}
