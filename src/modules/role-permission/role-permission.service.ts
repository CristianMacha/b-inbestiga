import { Injectable } from '@nestjs/common';

import {RolePermissionRepository} from "./role-permission.repository";

@Injectable()
export class RolePermissionService {
    constructor(private rolePermissionRepository: RolePermissionRepository) {
    }
}
