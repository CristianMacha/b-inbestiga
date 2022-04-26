import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { getConnection } from 'typeorm';

import { Invoice } from '../invoice/invoice.entity';
import { PersonProject } from '../person-project/person-project.entity';
import { Person } from '../person/person.entity';
import { PersonService } from '../person/person.service';
import { Project } from './project.entity';
import { ProjectRepository } from './project.repository';

@Injectable()
export class ProjectService {
    constructor(
        private projectRepository: ProjectRepository,
        private personService: PersonService,
    ) { }

    async create(project: Project, person: Person): Promise<Project> {
        try {
            const connection = getConnection();
            const projectCreated = await connection.transaction('SERIALIZABLE', async manager => {
                const personDb = await this.personService.findOne(person.id);
                if(!personDb) throw new NotFoundException('Person not found.');

                const newInvoice = new Invoice();
                newInvoice.total = project.invoice.total;
                const invoiceCreated = await manager.save(newInvoice);
                
                const newProject = this.projectRepository.create(project);
                newProject.invoice = invoiceCreated;
                const newProjectCreated = await manager.save(newProject);

                const newPersonProject = new PersonProject();
                newPersonProject.person = personDb;
                newPersonProject.project = newProjectCreated;
                await manager.save(newPersonProject);

                return newProjectCreated;
            });
            return projectCreated;
        } catch (error) {
            console.log(error);
            
            throw new BadRequestException(error);
        }
    }

    async findAll(): Promise<Project[]> {
        try {
            const listProject = await this.projectRepository.find({ where: { active: true } });
            return listProject;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async findOne(projectId: number): Promise<Project> {
        try {
            const projectDb = await this.projectRepository.findOne(projectId);
            return projectDb;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async findByPerson(personId: number): Promise<Project[]> {
        try {
            const listProject = await this.projectRepository.findByPerson(personId);
            return listProject;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }
}
