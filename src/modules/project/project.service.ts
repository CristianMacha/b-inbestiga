import {BadRequestException, ForbiddenException, Injectable, NotFoundException,} from '@nestjs/common';
import {getConnection} from 'typeorm';
import {nanoid} from "nanoid/async";

import {Invoice} from '../invoice/invoice.entity';
import {InvoiceService} from '../invoice/invoice.service';
import {PersonProject} from '../person-project/person-project.entity';
import {PersonProjectService} from '../person-project/person-project.service';
import {Project} from './project.entity';
import {ProjectRepository} from './project.repository';
import {Fee} from "../fee/fee.entity";
import {EInvoicePaymentMethod, EStatusPay} from "../../core/enums/status-pay.enum";
import {Person} from "../person/person.entity";
import {PersonRoleService} from "../person-role/person-role.service";
import {PermissionService} from "../permission/permission.service";
import {EResource} from "../../core/enums/resource.enum";

@Injectable()
export class ProjectService {
    constructor(
        private projectRepository: ProjectRepository,
        private invoiceService: InvoiceService,
        private personProjectService: PersonProjectService,
        private personRoleService: PersonRoleService,
        private permissionService: PermissionService,
    ) {
    }

    async create(project: Project): Promise<Project> {
        try {
            const connection = getConnection();
            const projectCreated = await connection.transaction(
                'SERIALIZABLE',
                async (manager) => {
                    const newProject = this.projectRepository.create(project);
                    const newProjectCreated = await manager.save(newProject);

                    for await (const invoice of project.invoices) {
                        const newInvoice = new Invoice();
                        newInvoice.code = await nanoid();
                        newInvoice.total = invoice.total;
                        newInvoice.description = invoice.description;
                        newInvoice.expirationDate = invoice.expirationDate;
                        newInvoice.project = newProjectCreated;
                        const newInvoiceCreated = await manager.save(newInvoice);

                        const newFees = this.generateFees(newInvoiceCreated.feesNumber, newInvoiceCreated.total);
                        for await (const fee of newFees) {
                            fee.code = await nanoid();
                            fee.invoice = newInvoiceCreated;

                            await manager.save(fee);
                        }
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
            console.log(error);
            throw new BadRequestException(error);
        }
    }

    async findAll(personAuth: Person, roleId: number): Promise<Project[]> {
        try {
            const personRoleDb = await this.personRoleService.findByPersonAndRole(personAuth.id, roleId);
            if (!personRoleDb) {
                throw new ForbiddenException('Access denied');
            }

            const permissionsProjectsResource = await this.permissionService.findByRoleAndResource(roleId, EResource.PROJECTS);
            if (!permissionsProjectsResource) {
                throw new ForbiddenException('Access denied');
            }

            const listProject = await this.projectRepository.findByPersonAndRoles(personAuth, permissionsProjectsResource);
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
            await this.projectRepository.save(projectDb);

            const project = await this.findOne(projectDb.id);
            return project;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async updateProgress(projectId: number, progress: number): Promise<Project> {
        try {
            const projectDb = await this.projectRepository.findOne(projectId);
            if (!projectDb) {
                throw new NotFoundException('Projectnot found.');
            }

            projectDb.progress = progress;
            const projectUpdated = await this.projectRepository.save(projectDb);
            return projectUpdated;
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
                        if (personProjectDb) {
                            personProjectDb.active = personProject.active;
                            personProjectDb.isAdvisor = personProject.isAdvisor;

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

    private generateFees(feeCount, invoiceTotal: number): Fee[] {
        const feePrice = Math.ceil((invoiceTotal / feeCount));
        const feesTemp: Fee[] = [];
        for (let i = 0; i < feeCount; i++) {
            const feeTemp = new Fee();
            feeTemp.total = feePrice;
            feeTemp.status = EStatusPay.PENDING;
            feeTemp.paymentMethod = EInvoicePaymentMethod.CASH_PAYMENT;

            feesTemp.push(feeTemp);
        }

        return feesTemp;
    }
}
