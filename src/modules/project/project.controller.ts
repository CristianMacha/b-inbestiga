import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Put,
    Query,
    Req,
    UseGuards
} from '@nestjs/common';

import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { Project } from './project.entity';
import { ProjectService } from './project.service';
import { ProjectAcceptInterface, ProjectFilterInterface } from "../../core/interfaces/project.interface";
import { ResponseListInterface } from "../../core/interfaces/response.interface";

@Controller('project')
export class ProjectController {
    constructor(private projectServices: ProjectService) {
    }

    @Get('refused/:id')
    async refuseAccept(@Param('id') projectId: string): Promise<Project> {
        return await this.projectServices.refuse(+projectId);
    }

    @Post('accept')
    async acceptProject(@Body() acceptProject: ProjectAcceptInterface): Promise<Project> {
        return await this.projectServices.accept(acceptProject);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Body() project: Project): Promise<Project> {
        return await this.projectServices.create(project);
    }

    @UseGuards(JwtAuthGuard)
    @Get('role/:id')
    async findAll(@Param('id') roleId: string, @Req() req, @Query() query: ProjectFilterInterface): Promise<ResponseListInterface<Project[]>> {
        return await this.projectServices.findAll(req.user, +roleId, query);
    }

    @UseGuards(JwtAuthGuard)
    @Post('request')
    async request(@Body() project: Project, @Req() req): Promise<Project> {
        return await this.projectServices.request(project, req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string, @Query() query: { withInvoice: string }, @Req() req): Promise<Project> {
        return await this.projectServices.findOne(+id, req.user, +req.headers.data, query.withInvoice);
    }

    @Get('person/:id')
    async findByPerson(@Param('id') id: string): Promise<Project[]> {
        return await this.projectServices.findByPerson(+id);
    }

    @Get('update/active/:id')
    async updateActive(@Param('id') projectId: string): Promise<Project> {
        return await this.projectServices.updateActive(+projectId);
    }

    @Get('update/archived/:id')
    async updateArchived(@Param('id') projectId: number): Promise<Project> {
        return await this.projectServices.updateArchived(projectId);
    }

    @Get('update/deleted/:id')
    async updateDeleted(@Param('id') projectId: number): Promise<Project> {
        return await this.projectServices.updateDeleted(projectId);
    }

    @Put()
    async update(@Body() project: Project): Promise<Project> {
        return await this.projectServices.update(project);
    }

    @Patch('progress/:id')
    async updateProgress(@Param('id') projectId: string, @Body() body: { progress: number }): Promise<Project> {
        return await this.projectServices.updateProgress(+projectId, body.progress);
    }
}
