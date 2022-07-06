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

    async create(project: Project): Promise<Project> {
        try {
            const connection = getConnection();
            const projectCreated = await connection.transaction('SERIALIZABLE', async manager => {
                const newProject = this.projectRepository.create(project);
                const newProjectCreated = await this.projectRepository.save(newProject);

                for await (const invoice of project.invoices) {
                    const newInvoice = new Invoice();
                    newInvoice.total = invoice.total;
                    newInvoice.description = invoice.description;
                    newInvoice.expirationDate = invoice.expirationDate;
                    newInvoice.project = newProjectCreated;
                    await manager.save(newInvoice);
                }

                for await (const personProject of project.personProjects) {
                    const newMember = new PersonProject();
                    newMember.person = personProject.person;
                    newMember.project = newProjectCreated;
                    newMember.isAdvisor = personProject.isAdvisor;

                    await manager.save(newMember);
                }

                return newProjectCreated;
            });

            return projectCreated;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    // async create(project: Project, person: Person, authUser: Person, asesor: Person): Promise<Project> {        
    //     try {
    //         const connection = getConnection();
    //         const projectCreated = await connection.transaction('SERIALIZABLE', async manager => {
    //             const personDb = await this.personService.findOne(person.id);
    //             if (!personDb) throw new NotFoundException('Person not found.');
                
    //             const newProject = this.projectRepository.create(project);
    //             const newProjectCreated = await manager.save(newProject);

    //             for await (const invoice of project.invoices) {
    //                 const newInvoice = new Invoice();
    //                 newInvoice.total = invoice.total;
    //                 newInvoice.description = invoice.description;
    //                 newInvoice.expirationDate = invoice.expirationDate;
    //                 newInvoice.project = newProjectCreated;
    //                 await manager.save(newInvoice);
    //             }
                
    //             // Asignar estudiante
    //             const newPersonProject = new PersonProject();
    //             newPersonProject.person = personDb;
    //             newPersonProject.project = newProjectCreated;
    //             await manager.save(newPersonProject);

    //             // Asignar asesor
    //             const asesorDb = await this.personService.findOne(asesor.id);
    //             if(asesorDb) {
    //                 const newAdvisor = new PersonProject();
    //                 newAdvisor.person = asesorDb;
    //                 newAdvisor.project = newProjectCreated;
    //                 newAdvisor.isAdvisor = true;
    //                 await manager.save(newAdvisor);
    //             } else {
    //                 const newAdvisor = new PersonProject();
    //                 newAdvisor.person = authUser;
    //                 newAdvisor.project = newProjectCreated;
    //                 newAdvisor.isAdvisor = true;
    //                 await manager.save(newAdvisor);
    //             }

    //             return newProjectCreated;
    //         });
    //         return projectCreated;
    //     } catch (error) {
    //         throw new BadRequestException(error);
    //     }
    // }

    async findAll(): Promise<Project[]> {
        try {
            const listProject = await this.projectRepository.find({ 
                relations: ['personProjects', 'personProjects.person'],
                where: { deleted: false }
             });
            return listProject;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async findOne(projectId: number): Promise<Project> {
        try {
            const projectDb = await this.projectRepository.findOne(projectId, {
                relations: ['personProjects', 'personProjects.person', 'category'],
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

    async updateActive(projectId: number): Promise<Project> {
        try {
            const projectDb = await this.projectRepository.findOne(projectId);
            if(!projectDb) { throw new NotFoundException('Project not found.'); }

            projectDb.active = !projectDb.active;
            const projectUpdate = await this.projectRepository.save(projectDb);
            return projectUpdate;
        } catch (error) {
            throw new BadRequestException(error);
        }
    } 

    async update(project: Project): Promise<Project> {
        try {
            const projectDb = await this.projectRepository.preload(project);
            if(!projectDb) { throw new NotFoundException('Project not found.') };
            const projecUpdated = await this.projectRepository.save(projectDb);
            return projecUpdated;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }
}
