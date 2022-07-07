import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Role } from './role.entity';
import { RoleRepository } from './role.repository';

@Injectable()
export class RoleService {
  constructor(private roleRepository: RoleRepository) {}

  async create(role: Role): Promise<Role> {
    try {
      const newRole = new Role();
      newRole.name = role.name;

      const roleCreated = await this.roleRepository.save(newRole);
      return roleCreated;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findOne(roleId: number): Promise<Role> {
    const roleDb = await this.roleRepository.findOne(roleId, {
      where: { active: true },
    });
    return roleDb;
  }

  async findAll(): Promise<Role[]> {
    const listRole = await this.roleRepository.find({
      where: { active: true },
    });
    return listRole;
  }

  async updateActive(roleId: number): Promise<Role> {
    try {
      const roleDb = await this.roleRepository.findOne(roleId);
      if (!roleDb) {
        throw new NotFoundException('Role not found.');
      }

      roleDb.active = !roleDb.active;
      const roleUpdate = await this.roleRepository.save(roleDb);
      return roleUpdate;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async update(role: Role): Promise<Role> {
    try {
      const roleDb = await this.roleRepository.preload(role);
      if (!roleDb) {
        throw new NotFoundException('Role not found.');
      }

      const roleUpdate = await this.roleRepository.save(roleDb);
      return roleUpdate;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
