import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';

import { Requirement } from './requirement.entity';
import { RequirementService } from './requirement.service';

@Controller('requirement')
export class RequirementController {
  constructor(private requirementServices: RequirementService) {}

  @Post()
  async create(@Body() requirement: Requirement): Promise<Requirement> {
    return await this.requirementServices.create(requirement);
  }

  @Get()
  async findAll(): Promise<Requirement[]> {
    return await this.requirementServices.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Requirement> {
    return await this.requirementServices.findOne(+id);
  }

  @Get('project/:id')
  async findByProject(@Param('id') id: string): Promise<Requirement[]> {
    return await this.requirementServices.findByProject(+id);
  }

  @Get('update/active/:id')
  async updateActive(@Param('id') requirementId: string): Promise<Requirement> {
    return await this.requirementServices.updateActive(+requirementId);
  }

  @Put()
  async update(@Body() requirement: Requirement): Promise<Requirement> {
    return await this.requirementServices.update(requirement);
  }
}
