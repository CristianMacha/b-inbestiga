import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { getConnection } from 'typeorm';

import { Invoice } from '../invoice/invoice.entity';
import { InvoiceService } from '../invoice/invoice.service';
import { PersonProject } from '../person-project/person-project.entity';
import { PersonProjectService } from '../person-project/person-project.service';
import { Project } from './project.entity';
import { ProjectRepository } from './project.repository';

@Injectable()
export class ProjectService {
  constructor(
    private projectRepository: ProjectRepository,
    private invoiceService: InvoiceService,
    private personProjectService: PersonProjectService,
  ) {}

  async create(project: Project): Promise<Project> {
    try {
      const connection = getConnection();
      const projectCreated = await connection.transaction(
        'SERIALIZABLE',
        async (manager) => {
          const newProject = this.projectRepository.create(project);
          const newProjectCreated = await this.projectRepository.save(
            newProject,
          );

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
        },
      );

      return projectCreated;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAll(): Promise<Project[]> {
    try {
      const listProject = await this.projectRepository.find({
        relations: ['personProjects', 'personProjects.person'],
        where: { deleted: false },
      });
      return listProject;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findOne(projectId: number): Promise<Project> {
    try {
      const projectDb = await this.projectRepository.findOne(projectId, {
        relations: [
          'personProjects',
          'personProjects.person',
          'category',
          'invoices',
        ],
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
      if (!projectDb) {
        throw new NotFoundException('Project not found.');
      }

      projectDb.active = !projectDb.active;
      const projectUpdate = await this.projectRepository.save(projectDb);
      return projectUpdate;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async update(project: Project): Promise<Project> {
    try {
      const connection = getConnection();
      const projectUpdate = await connection.transaction(
        'SERIALIZABLE',
        async (manager) => {
          const projectDb = await this.projectRepository.preload(project);
          const projectDbUpdated = await manager.save(projectDb);

          for await (const invoice of project.invoices) {
            const invoiceDb = await this.invoiceService.findOne(invoice.id);
            if (!invoiceDb) {
              throw new NotFoundException('Invoice not found.');
            }
            invoiceDb.total = invoice.total;
            await manager.save(invoiceDb);
          }

          for await (const personProject of project.personProjects) {
            const personProjectDb = await this.personProjectService.findOne(
              personProject.id,
            );
            if (personProject) {
              personProjectDb.active = personProject.active;
              personProject.isAdvisor = personProject.isAdvisor;

              await manager.save(personProjectDb);
            } else {
              const newPersonProject = new PersonProject();
              newPersonProject.person = personProject.person;
              newPersonProject.project = projectDbUpdated;
              newPersonProject.isAdvisor = personProject.isAdvisor;

              await manager.save(newPersonProject);
            }
          }
          return projectDbUpdated;
        },
      );

      return projectUpdate;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
