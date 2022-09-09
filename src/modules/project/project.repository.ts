import { EntityRepository, Repository } from 'typeorm';

import { Project } from './project.entity';
import { Person } from "../person/person.entity";
import { Permission } from "../permission/permission.entity";
import { CPermission } from "../../core/enums/permission.enum";
import { ProjectFilterInterface } from "../../core/interfaces/project.interface";
import { ResponseListInterface } from "../../core/interfaces/response.interface";
import { ERole } from "../../core/enums/role.enum";

@EntityRepository(Project)
export class ProjectRepository extends Repository<Project> {

    /**
     * Get list by person and role
     * @param person model
     * @param permissions model[]
     * @param filters interface
     */
    async findByPersonAndRoles(person: Person, permissions: Permission[], filters?: ProjectFilterInterface): Promise<ResponseListInterface<Project[]>> {
        const query = this.createQueryBuilder('project')
            .innerJoinAndSelect('project.personProjects', 'personProject')
            .innerJoinAndSelect('personProject.person', 'person')
            .where('project.deleted=false')
            .andWhere('project.archived=false')

        //TODO: El proyecto debe tener almenos un integrante

        if (filters.status !== 'ALL') {
            query.andWhere('project.status=:projectStatus', { projectStatus: filters.status });
        }

        permissions.forEach((permission) => {
            switch (permission.id) {
                case CPermission.P_PROJECT.LIST_ALL:
                    break;

                case CPermission.P_PROJECT.LIST_BY_PERSON:
                    query.andWhere('person.id=:personId', { personId: person.id });
                    break;

                default:
                    break;
            }
        });

        query.take(+filters.take);
        query.skip((+filters.skip) * (+filters.take));
        query.orderBy('project.updatedAt', 'DESC');
        return { data: await query.getMany(), total: await query.getCount() };
    }

    async findByPerson(personId: number): Promise<Project[]> {
        const query = this.createQueryBuilder('project')
            .innerJoin('project.personProjects', 'personProject')
            .innerJoin('personProject.person', 'person')
            .where('person.id=:personId', { personId })
            .andWhere('project.deleted=false');

        return await query.getMany();
    }

    async findOneByRole(projectId: number, person: Person, roleId: number, withInvoice: string): Promise<Project> {
        const query = this.createQueryBuilder('project')
            .innerJoinAndSelect('project.personProjects', 'personProject')
            .innerJoinAndSelect('personProject.person', 'person')
            .innerJoinAndSelect('person.user', 'user')
            .innerJoinAndSelect('project.category', 'category')

        if (withInvoice === 'true') {
            query.innerJoinAndSelect('project.invoices', 'invoice');
        }
        query.where('project.id=:projectId', { projectId });

        if (roleId !== ERole.ADMINISTRATOR) {
            //query.andWhere('person.id=:personId', {personId: person.id});
        }

        query.andWhere('project.active=true');
        query.andWhere('project.deleted=false');

        return await query.getOne();
    }
}
