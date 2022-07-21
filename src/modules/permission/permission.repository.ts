import {EntityRepository, Repository} from "typeorm";
import {Permission} from "./permission.entity";

@EntityRepository(Permission)
export class PermissionRepository extends Repository<Permission> {
    async findByPerson(personId: number): Promise<Permission[]> {
        const query = this.createQueryBuilder('permission')
            .innerJoin('permission.role', 'role')
            .innerJoin('role.personRoles', 'personRole')
            .innerJoin('personRole.person', 'person')
            .where('person.id=:personId', {personId})
            .andWhere('permission.active=true')
            .andWhere('permission.deleted=false');

        return await query.getMany();
    }
}
