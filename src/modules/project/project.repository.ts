import { EntityRepository, Repository } from "typeorm";
import { Project } from "./project.entity";

@EntityRepository(Project)
export class ProjectRepository extends Repository<Project> {
    async findByPerson(personId: number): Promise<Project[]> {
        const query = this.createQueryBuilder('project')
            .innerJoin('project.personProjects', 'personProject')
            .innerJoin('personProject.person', 'person')
            .where('person.id=:personId', { personId })
            .andWhere('project.active=true')

        const result = await query.getMany();
        return result;
    }
}
