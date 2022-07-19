import {Body, Controller, Get, Param, Patch, Post, Put, Query, Req, UseGuards} from '@nestjs/common';

import {JwtAuthGuard} from '../../core/guards/jwt-auth.guard';
import {Project} from './project.entity';
import {ProjectService} from './project.service';
import {ProjectFilterInterface} from "../../core/interfaces/project-filter.interface";

@Controller('project')
export class ProjectController {
    constructor(private projectServices: ProjectService) {
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Body() project: Project): Promise<Project> {
        return await this.projectServices.create(project);
    }

    @UseGuards(JwtAuthGuard)
    @Get('role/:id')
    async findAll(@Param('id') roleId: string, @Req() req, @Query() query: ProjectFilterInterface): Promise<Project[]> {
        return await this.projectServices.findAll(req.user, +roleId, query);
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Project> {
        return await this.projectServices.findOne(+id);
    }

    @Get('person/:id')
    async findByPerson(@Param('id') id: string): Promise<Project[]> {
        return await this.projectServices.findByPerson(+id);
    }

    @Get('update/active/:id')
    async updateActive(@Param('id') projectId: string): Promise<Project> {
        return await this.projectServices.updateActive(+projectId);
    }

    @Put()
    async update(@Body() project: Project): Promise<Project> {
        return await this.projectServices.update(project);
    }

    @Patch('progress/:id')
    async updateProgress(
        @Param('id') projectId: string,
        @Body() body: { progress: number },
    ): Promise<Project> {
        return await this.projectServices.updateProgress(+projectId, body.progress);
    }
}
