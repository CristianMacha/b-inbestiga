import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';

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

  @Get(':id')
  async findOne(@Param('id') personId: string): Promise<Person> {
    return await this.personServices.findOne(+personId);
  }

  @Get('user/:id')
  async findOneByUser(@Param('id') id: string): Promise<Person> {
    return await this.personServices.findOneByUser(+id);
  }

  @Get('role/:id')
  async findAllByRole(@Param('id') roleId: string): Promise<Person[]> {
    return await this.personServices.findAllByRole(+roleId);
  }

  @Get('update/active/:id')
  async updateActive(@Param('id') personId: string): Promise<Person> {
    return await this.personServices.updateActive(+personId);
  }

  @Put()
  async update(@Body() person: Person): Promise<Person> {
    return await this.personServices.update(person);
  }

  @Get('find/members')
  async findByCodeAndRole(@Query() query: { code: string; roleId: number }) {
    return await this.personServices.findByCodeAndRole(
      query.code,
      query.roleId,
    );
  }
}
