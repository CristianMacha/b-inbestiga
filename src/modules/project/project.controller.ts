import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { Person } from '../person/person.entity';
import { Project } from './project.entity';
import { ProjectService } from './project.service';

@Controller('project')
export class ProjectController {
  constructor(private projectServices: ProjectService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() data: { project: Project, person: Person },
    @Req() req
  ): Promise<Project> {
    return await this.projectServices.create(data.project, data.person, req.user);
  }

  @Get()
  async findAll(): Promise<Project[]> {
    return await this.projectServices.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Project> {
    return await this.projectServices.findOne(+id);
  }

  @Get('person/:id')
  async findByPerson(@Param('id') id: string): Promise<Project[]> {
    return await this.projectServices.findByPerson(+id);
  }
}
