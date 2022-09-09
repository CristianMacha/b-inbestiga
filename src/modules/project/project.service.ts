import {BadRequestException, ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import {getConnection} from 'typeorm';
import {nanoid} from "nanoid/async";

import {Invoice} from '../invoice/invoice.entity';
import {InvoiceService} from '../invoice/invoice.service';
import {PersonProject} from '../person-project/person-project.entity';
import {PersonProjectService} from '../person-project/person-project.service';
import {Project} from './project.entity';
import {ProjectRepository} from './project.repository';
import {Fee} from "../fee/fee.entity";
import {Person} from "../person/person.entity";
import {PersonRoleService} from "../person-role/person-role.service";
import {PermissionService} from "../permission/permission.service";
import {NanoidService} from "../../core/helpers/nanoid.service";
import {EFeeStatus} from "../../core/enums/fee-status.enum";
import {EProjectStatus} from "../../core/enums/project.enum";
import {CreateProjectInterface, ProjectAcceptInterface, ProjectFilterInterface} from "../../core/interfaces/project.interface";
import {PersonService} from "../person/person.service";
import {ResponseListInterface} from "../../core/interfaces/response.interface";
import * as moment from "moment";

@Injectable()
export class ProjectService {
    constructor(
        private projectRepository: ProjectRepository,
        private invoiceService: InvoiceService,
        private personProjectService: PersonProjectService,
        private personRoleService: PersonRoleService,
        private permissionService: PermissionService,
        private personService: PersonService,
        private nanoService: NanoidService,
    ) {
    }

    /**
     * Accept project
     * @param projectAccept
     */
    async accept(projectAccept: ProjectAcceptInterface): Promise<Project> {
        const projectDb = await this.projectRepository.findOne(projectAccept.projectId);
        const advisorDb = await this.personService.findOne(projectAccept.advisorId);
        if (!advisorDb) {
            throw new NotFoundException('Person not found.')
        }

        const connection = getConnection();
        return await connection.transaction('SERIALIZABLE', async manager => {
            projectDb.status = EProjectStatus.ACCEPTED;
            projectDb.expirationDate = projectAccept.expirationDate;
            const projectUpdated = await manager.save(projectDb);

            const newInvoice = new Invoice();
            newInvoice.project = projectUpdated;
            newInvoice.total = projectAccept.amount;
            newInvoice.code = await this.nanoService.gProjectCode();
            newInvoice.feesNumber = projectAccept.feesNumber;
            newInvoice.expirationDate = projectUpdated.expirationDate;
            const invoiceCreated = await manager.save(newInvoice);

            const fees = this.generateFees(invoiceCreated.feesNumber, invoiceCreated.total);
            for await (const fee of fees) {
                fee.invoice = invoiceCreated;
                await manager.save(fee);
            }

            const newPersonProject = new PersonProject();
            newPersonProject.project = projectDb;
            newPersonProject.person = advisorDb;
            newPersonProject.isAdvisor = true;
            await manager.save(newPersonProject);

            return projectUpdated;
        });
    }

    /**
     * Refuse project
     * @param projectId
     */
    async refuse(projectId: number): Promise<Project> {
        const projectDb = await this.projectRepository.findOne(projectId);
        projectDb.status = EProjectStatus.REFUSED;
        return await this.projectRepository.save(projectDb);
    }

    /**
     * Request new project
     * @param project
     * @param personAuth
     */
    async request(project: Project, personAuth: Person): Promise<Project> {
        try {
            const connection = getConnection();
            return await connection.transaction('SERIALIZABLE', async manager => {
                const projectCode = await this.nanoService.gProjectCode();
                const newProject = this.projectRepository.create(project);
                newProject.status = EProjectStatus.REQUIRED;
                newProject.code = projectCode;
                const newProjectCreated = await manager.save(newProject);

                const newPersonProject = new PersonProject();
                newPersonProject.person = personAuth;
                newPersonProject.project = newProjectCreated;
                await manager.save(newPersonProject);

                return newProjectCreated;
            });
        } catch (e) {
            throw new BadRequestException(e);
        }
    }

    async create(createProject: CreateProjectInterface): Promise<Project> {
        const { advisors, fees, invoice, project, students} = createProject;
        const connection = getConnection();
        const projectCreated = await connection.transaction('SERIALIZABLE', async manager => {
            const projectCode = await this.nanoService.gProjectCode();
            const newproject = this.projectRepository.create(project);
            if (project.id == 0) {newproject.code = projectCode;}
            newproject.status = EProjectStatus.PENDING;
            const newProjectCreated = await manager.save(newproject);

            const newInvoice = new Invoice();
            newInvoice.id = invoice.id;
            if(invoice.id == 0) {newInvoice.code = await nanoid();}
            newInvoice.total = invoice.total;
            newInvoice.description = invoice.description;
            newInvoice.expirationDate = project.expirationDate;
            newInvoice.feesNumber = invoice.feesNumber;
            newInvoice.project = newProjectCreated;
            const newInvoiceCreated = await manager.save(newInvoice);

            for await (const fee of fees) {
                const newFee = new Fee();
                newFee.id = fee.id;
                newFee.total = fee.total;
                newFee.invoice = newInvoiceCreated;
                newFee.paymentDate = fee.paymentDate;
                newFee.status = EFeeStatus.DEBT;

                await manager.save(newFee);
            }

            for await (const advisor of advisors) {
                const newAdvisor = new PersonProject();
                newAdvisor.id = advisor.id;
                newAdvisor.active = advisor.active;
                newAdvisor.person = advisor.person;
                newAdvisor.project = newProjectCreated;
                newAdvisor.isAdvisor = true;

                await manager.save(newAdvisor);
            }

            for await (const student of students) {
                const newStudent = new PersonProject();
                newStudent.id = student.id;
                newStudent.active = student.active;
                newStudent.person = student.person;
                newStudent.project = newProjectCreated;
                newStudent.isAdvisor = false;

                await manager.save(newStudent);
            }

            return newProjectCreated;
        });

        return projectCreated;
    }

    /**
     * List all with filter and pagination
     * @param personAuth
     * @param roleId
     * @param filter
     */
    async findAll(personAuth: Person, roleId: number, filter?: ProjectFilterInterface): Promise<ResponseListInterface<Project[]>> {
        const personRoleDb = await this.personRoleService.findByPersonAndRole(personAuth.id, roleId);
        if (!personRoleDb) {
            throw new ForbiddenException('Access denied');
        }

        const permissionsRole = await this.permissionService.findByRole(roleId);
        if (permissionsRole.length == 0) {
            throw new ForbiddenException('Access denied');
        }

        return await this.projectRepository.findByPersonAndRoles(personAuth, permissionsRole, filter);
    }

    async findOne(projectId: number, personAuth: Person, roleIdAuth: number, withInvoice: string): Promise<Project> {
        return await this.projectRepository.findOneByRole(projectId, personAuth, roleIdAuth, withInvoice);
    }

    async findByPerson(personId: number): Promise<Project[]> {
        try {
            return await this.projectRepository.findByPerson(personId);
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async updateActive(projectId: number): Promise<Project> {
        const projectDb = await this.projectRepository.findOne(projectId);
        if (!projectDb) {
            throw new NotFoundException('Project not found.');
        }

        projectDb.active = !projectDb.active;
        return await this.projectRepository.save(projectDb);
    }

    async updateArchived(projectId: number): Promise<Project> {
        const projectDb = await this.projectRepository.findOne(projectId);
        if (!projectDb.active) {
            throw new ForbiddenException(`Cant update project`)
        }

        projectDb.archived = !projectDb.archived;
        return await this.projectRepository.save(projectDb);
    }

    async updateDeleted(projectId: number): Promise<Project> {
        const projectDb = await this.projectRepository.findOne(projectId);
        if (!projectDb) {
            throw new NotFoundException('Not found project.')
        }

        projectDb.deleted = true;
        return await this.projectRepository.save(projectDb);
    }

    async updateProgress(projectId: number, progress: number): Promise<Project> {
        const projectDb = await this.projectRepository.findOne(projectId);
        if (!projectDb) {
            throw new NotFoundException('Project not found.');
        }

        projectDb.progress = progress;
        if (projectDb.progress == 100) {
            projectDb.status = EProjectStatus.COMPLETED;
        }
        return await this.projectRepository.save(projectDb);
    }

    async update(project: Project): Promise<Project> {
        try {
            const connection = getConnection();
            return await connection.transaction(
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
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    private generateFees(feeCount, invoiceTotal: number): Fee[] {
        const currentDate = moment();
        const feePrice = Math.ceil((invoiceTotal / feeCount));
        const feesTemp: Fee[] = [];
        for (let i = 0; i < feeCount; i++) {
            const feeTemp = new Fee();
            feeTemp.total = feePrice;
            feeTemp.status = EFeeStatus.DEBT;
            feeTemp.paymentDate = currentDate.add(1, 'month').toDate();

            feesTemp.push(feeTemp);
        }

        return feesTemp;
    }
}
