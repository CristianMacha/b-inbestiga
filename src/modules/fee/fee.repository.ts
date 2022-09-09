import { EntityRepository, Repository } from 'typeorm';
import { Fee } from './fee.entity';

@EntityRepository(Fee)
export class FeeRepository extends Repository<Fee> {
    async findByProject(projectId: number): Promise<Fee[]> {
        const query = this.createQueryBuilder('fee')
            .innerJoin('fee.invoice', 'invoice')
            .innerJoin('invoice.project', 'project')
            .where('project.id=:projectId', {projectId})
            .andWhere('fee.active=true');

        return await query.getMany();
    }
}
