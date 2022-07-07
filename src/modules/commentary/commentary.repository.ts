import { EntityRepository, Repository } from 'typeorm';
import { Commentary } from './commentary.entity';

@EntityRepository(Commentary)
export class CommentaryRepository extends Repository<Commentary> {}
