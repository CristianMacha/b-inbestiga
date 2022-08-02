import {EntityRepository, Repository} from "typeorm";
import {RoleResourceEntity} from "./role-resource.entity";

@EntityRepository(RoleResourceEntity)
export class RoleResourceRepository extends Repository<RoleResourceEntity> {
}
