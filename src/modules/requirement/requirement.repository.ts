import { EntityRepository, Repository } from 'typeorm';
import { Requirement } from './requirement.entity';

@EntityRepository(Requirement)
export class RequirementRepository extends Repository<Requirement> {}
