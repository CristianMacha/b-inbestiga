import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Petition } from './petition.entity';
import { PetitionService } from './petition.service';

@Controller('petition')
export class PetitionController {
    constructor(private petitionServices: PetitionService) {}

    @Post()
    async create(@Body() petition: Petition): Promise<Petition> {
        return await this.petitionServices.create(petition);
    }

    @Get()
    async findAll(): Promise<Petition[]> {
        return await this.petitionServices.findAll();
    }

    @Get(':petitionId')
    async findOne(@Param('petitionId') petitionId: string): Promise<Petition> {
        return await this.petitionServices.findOne(+petitionId);
    }
}
