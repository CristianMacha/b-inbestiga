import { Body, Controller, Get, Post } from '@nestjs/common';
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
}
