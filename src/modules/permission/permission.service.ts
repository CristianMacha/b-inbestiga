import {BadRequestException, Injectable} from '@nestjs/common';

import {PermissionRepository} from "./permission.repository";
import {Permission} from "./permission.entity";

@Injectable()
export class PermissionService {
    constructor(private permissionRepository: PermissionRepository) {
    }

    async findByRoleAndResource(roleId: number, resourceId: number): Promise<Permission[]> {
        try {
            return await this.permissionRepository.find({
                where: {
                    role: {id: roleId},
                    resource: {id: resourceId},
                    active: true,
                    deleted: false,
                }
            });
        } catch (error) {
            throw  new BadRequestException(error);
        }
    }

    async findAllByPerson(personId: number): Promise<Permission[]> {
        try {
            return await this.permissionRepository.findByPerson(personId);
        } catch (error) {
            throw new BadRequestException(error)
        }
    }
}
