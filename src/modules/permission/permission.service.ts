import {BadRequestException, Injectable} from '@nestjs/common';

import {PermissionRepository} from "./permission.repository";
import {Permission} from "./permission.entity";

@Injectable()
export class PermissionService {
    constructor(private permissionRepository: PermissionRepository) {
    }

    async findByRoleAndResource(roleId: number, resourceId: number): Promise<Permission[]> {
        try {
            const permissionList = await this.permissionRepository.find({
                where: {
                    role: {id: roleId},
                    active: true,
                    deleted: false,
                }
            });
            return permissionList;
        } catch (error) {
            throw  new BadRequestException(error);
        }
    }
}
