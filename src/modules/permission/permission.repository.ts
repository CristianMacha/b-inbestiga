import {EntityRepository, Repository} from "typeorm";
import {Permission} from "./permission.entity";

@EntityRepository(Permission)
export class PermissionRepository extends Repository<Permission> {
    async findByRole(roleId: number): Promise<Permission[]> {
        const query = this.createQueryBuilder('permission')
            .innerJoin('permission.rolePermissions', 'rolePermission')
            .innerJoin('rolePermission.role', 'role')
            .where('role.id=:roleId', {roleId})
            .andWhere('rolePermission.active=true');

        return await query.getMany();
    }
}
