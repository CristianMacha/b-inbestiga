import { Controller } from '@nestjs/common';
import {RoleResourceService} from "./role-resource.service";

@Controller('role-resource')
export class RoleResourceController {
    constructor(private roleResourceService: RoleResourceService) {
    }
}
