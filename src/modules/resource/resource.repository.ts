import {EntityRepository, Repository} from "typeorm";
import {ResourceEntity} from "./resourceEntity";

@EntityRepository(ResourceEntity)
export class ResourceRepository extends Repository<ResourceEntity> {
    async findByRole(roleId: number): Promise<ResourceEntity[]> {
        const query = this.createQueryBuilder('resource')
            .innerJoin('resource.roleResources', 'roleResource')
            .innerJoin('roleResource.role', 'role')
            .where('role.id=:roleId', {roleId})
            .andWhere('resource.active=true');

        return await query.getMany();
    }
}
