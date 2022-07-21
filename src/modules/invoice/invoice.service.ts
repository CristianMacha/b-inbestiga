import {
    BadRequestException, ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import {Invoice} from './invoice.entity';
import {InvoiceRepository} from './invoice.repository';
import {Person} from "../person/person.entity";
import {PersonRoleService} from "../person-role/person-role.service";
import {PermissionService} from "../permission/permission.service";

@Injectable()
export class InvoiceService {
    constructor(
        private invoiceRepository: InvoiceRepository,
        private personRoleService: PersonRoleService,
        private permissionService: PermissionService,
    ) {
    }

    async findByPerson(personId: number): Promise<Invoice[]> {
        try {
            return await this.invoiceRepository.findByPerson(personId);
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async findOneByProject(projectId: number): Promise<Invoice> {
        try {
            const invoiceDb = await this.invoiceRepository.findOne({
                where: {project: {id: projectId}},
            });
            if (!invoiceDb) {
                throw new NotFoundException('Invoice not found.');
            }

            return invoiceDb;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async create(invoice: Invoice): Promise<Invoice> {
        try {
            const newInvoice = this.invoiceRepository.create(invoice);
            return await this.invoiceRepository.save(newInvoice);
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async findAll(personAuth: Person, roleId: number): Promise<Invoice[]> {
        try {
            const personRoleDb = await this.personRoleService.findByPersonAndRole(personAuth.id, roleId);
            if (!personRoleDb) {
                throw new ForbiddenException('Access denied.');
            }

            const permissionsRole = await this.permissionService.findByRole(roleId);
            if (permissionsRole.length == 0) {
                throw new ForbiddenException('Access denied');
            }

            return await this.invoiceRepository.findByPersonAndRole(personAuth, permissionsRole)
        } catch (error) {
            console.log(error)
            throw new BadRequestException(error);
        }
    }

    async findOne(invoiceId: number): Promise<Invoice> {
        try {
            return await this.invoiceRepository.findOne(invoiceId, {
                relations: ['fees', 'project'],
            });
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async updateActive(invoiceId: number): Promise<Invoice> {
        try {
            const invoiceDb = await this.invoiceRepository.findOne(invoiceId);
            if (!invoiceDb) {
                throw new NotFoundException('Invoice not found.');
            }

            invoiceDb.active = !invoiceDb.active;
            return await this.invoiceRepository.save(invoiceDb);
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async update(invoice: Invoice): Promise<Invoice> {
        try {
            const invoiceDb = await this.invoiceRepository.preload(invoice);
            if (!invoiceDb) {
                throw new NotFoundException('Invoice not found.');
            }

            return await this.invoiceRepository.save(invoiceDb);
        } catch (error) {
            throw new BadRequestException(error);
        }
    }
}
