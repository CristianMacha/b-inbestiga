import { EntityRepository, Repository } from 'typeorm';
import { PersonRole } from './person-role.entity';

@EntityRepository(PersonRole)
export class PersonRoleRepository extends Repository<PersonRole> {}
