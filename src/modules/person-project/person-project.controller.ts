import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PersonProject } from './person-project.entity';
import { PersonProjectService } from './person-project.service';

@Controller('person-project')
export class PersonProjectController {
    constructor(private personProjectServices: PersonProjectService) {}

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
}
