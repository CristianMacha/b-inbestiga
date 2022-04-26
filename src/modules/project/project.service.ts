import { BadRequestException, Injectable } from '@nestjs/common';
import { getConnection } from 'typeorm';
import { Invoice } from '../invoice/invoice.entity';
import { Project } from './project.entity';
import { ProjectRepository } from './project.repository';

@Injectable()
export class ProjectService {
    constructor(
        private projectRepository: ProjectRepository
    ) { }

    async create(project: Project): Promise<Project> {
        try {
            const connection = getConnection();
            const projectCreated = await connection.transaction('SERIALIZABLE', async manager => {
                const newInvoice = new Invoice();
                newInvoice.total = project.invoice.total;
                const invoiceCreated = await manager.save(newInvoice);
                
                const newProject = this.projectRepository.create(project);
                newProject.invoice = invoiceCreated;
                const newProjectCreated = await manager.save(newProject);

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
