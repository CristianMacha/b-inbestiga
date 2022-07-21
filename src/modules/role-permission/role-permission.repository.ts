import {EntityRepository, Repository} from "typeorm";
import {RolePermission} from "./role-permission.entity";

@EntityRepository(RolePermission)
export class RolePermissionRepository extends Repository<RolePermission> {
}