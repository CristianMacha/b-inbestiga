import { EntityRepository, Repository } from 'typeorm';
import { PersonProject } from './person-project.entity';

@EntityRepository(PersonProject)
export class PersonProjectRepository extends Repository<PersonProject> {}
