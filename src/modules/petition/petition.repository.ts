import { EntityRepository, Repository } from 'typeorm';
import { Petition } from './petition.entity';

@EntityRepository(Petition)
export class PetitionRepository extends Repository<Petition> {}
