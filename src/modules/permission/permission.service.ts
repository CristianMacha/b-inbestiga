import {BadRequestException, Injectable} from '@nestjs/common';

import {PermissionRepository} from "./permission.repository";
import {Permission} from "./permission.entity";

@Injectable()
export class PermissionService {
    constructor(private permissionRepository: PermissionRepository) {
    }

    async findByResource(resourceId: number): Promise<Permission[]> {
        try {
            return await this.permissionRepository.find({
                where: {
                    resource: {id: resourceId},
                    active: true,
                    deleted: false,
                }
            });
        } catch (error) {
            throw  new BadRequestException(error);
        }
    }

    async findByRole(roleId: number): Promise<Permission[]> {
        try {
            return await this.permissionRepository.findByRole(roleId);
        } catch (error) {
            throw new BadRequestException(error)
        }
    }
}
