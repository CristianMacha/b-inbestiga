import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { Role } from './role.entity';
import { RoleService } from './role.service';

@Controller('role')
export class RoleController {
  constructor(private roleServices: RoleService) { }

  @Post()
  async create(@Body() role: Role): Promise<Role> {
    return await this.roleServices.create(role);
  }

  @Get()
  async findAll(): Promise<Role[]> {
    return await this.roleServices.findAll();
  }

  @Get('update/active/:id')
  async updateActive(@Param('id') roleId: string): Promise<Role> {
    return await this.roleServices.updateActive(+roleId);
  }

  @Put()
  async update(@Body() role: Role): Promise<Role> {
    return await this.roleServices.update(role);
  }
}
