import { Body, Controller, Post } from '@nestjs/common';
import { Role } from './role.entity';
import { RoleService } from './role.service';

@Controller('role')
export class RoleController {
  constructor(private roleServices: RoleService) {}

  @Post()
  async create(@Body() role: Role): Promise<Role> {
    return await this.roleServices.create(role);
  }
}
