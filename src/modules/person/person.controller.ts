import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { Person } from './person.entity';
import { PersonService } from './person.service';

@Controller('person')
export class PersonController {
  constructor(private personServices: PersonService) {}

  @Post()
  async create(@Body() person: Person): Promise<Person> {
    return await this.personServices.create(person);
  }

  @Get()
  async findAll(): Promise<Person[]> {
    return await this.personServices.findAll();
  }

  @Get('user/:id')
  async findOneByUser(@Param('id') id: string): Promise<Person> {
    return await this.personServices.findOneByUser(+id);
  }

  @Get('role/:id')
  async findAllByRole(@Param('id') roleId: string): Promise<Person[]> {
    return await this.personServices.findAllByRole(+roleId);
  }
}
