import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IPayloadJwt } from 'src/core/interfaces/payload-jwt.interface';
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

    async create(project: Project, person: Person, authUser: Person): Promise<Project> {
        try {
            const connection = getConnection();
            const projectCreated = await connection.transaction('SERIALIZABLE', async manager => {
                const personDb = await this.personService.findOne(person.id);
                if (!personDb) throw new NotFoundException('Person not found.');

                const newInvoice = new Invoice();
                newInvoice.total = project.invoice.total;
                const invoiceCreated = await manager.save(newInvoice);

                const newProject = this.projectRepository.create(project);
                newProject.invoice = invoiceCreated;
                const newProjectCreated = await manager.save(newProject);

                // Asignar estudiante
                const newPersonProject = new PersonProject();
                newPersonProject.person = personDb;
                newPersonProject.project = newProjectCreated;
                await manager.save(newPersonProject);

                // Asignar asesor
                const newAdvisor = new PersonProject();
                newAdvisor.person = authUser;
                newAdvisor.project = newProjectCreated;
                newAdvisor.isAdvisor = true;
                await manager.save(newAdvisor);

                return newProjectCreated;
            });
            return projectCreated;
        } catch (error) {
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
            const projectDb = await this.projectRepository.findOne(projectId, {
                relations: ['personProjects', 'personProjects.person'],
            });
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
