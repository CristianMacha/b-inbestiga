import {Body, Controller, Get, Param, Post, Put} from '@nestjs/common';
import {PersonProject} from './person-project.entity';
import {PersonProjectService} from './person-project.service';

@Controller('person-project')
export class PersonProjectController {
    constructor(private personProjectServices: PersonProjectService) {
    }

    @Post()
    async create(@Body() personProject: PersonProject): Promise<PersonProject> {
        return await this.personProjectServices.create(personProject);
    }

    @Get()
    async findAll(): Promise<PersonProject[]> {
        return await this.personProjectServices.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<PersonProject> {
        return await this.personProjectServices.findOne(+id);
    }

    @Get('person/:id')
    async findByPerson(@Param('id') id: string): Promise<PersonProject[]> {
        return await this.personProjectServices.findByPerson(+id);
    }

    @Get('project/:id')
    async findByProject(@Param('id') projectId: string): Promise<PersonProject[]> {
        return await this.personProjectServices.findByProject(+projectId);
    }

    @Get('update/active/:id')
    async updateActive(
        @Param('id') personProjectId: string,
    ): Promise<PersonProject> {
        return await this.personProjectServices.updateActive(+personProjectId);
    }

    @Put()
    async update(@Body() personProject: PersonProject): Promise<PersonProject> {
        return await this.personProjectServices.update(personProject);
    }
}
