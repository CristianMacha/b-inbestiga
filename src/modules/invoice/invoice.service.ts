import {BadRequestException, ForbiddenException, Injectable, NotFoundException,} from '@nestjs/common';

import {Invoice} from './invoice.entity';
import {InvoiceRepository} from './invoice.repository';
import {Person} from "../person/person.entity";
import {PersonRoleService} from "../person-role/person-role.service";
import {PermissionService} from "../permission/permission.service";
import {InvoiceFilterInterface} from "../../core/interfaces/invoice.interface";
import {ResponseListInterface} from "../../core/interfaces/response.interface";
import {InvoiceStatusEnum} from "../../core/enums/invoice.enum";
import { PaymentService } from '../payment/payment.service';
import { PaymentStatusEnum } from 'src/core/enums/payment.enum';

@Injectable()
export class InvoiceService {
    constructor(
        private invoiceRepository: InvoiceRepository,
        private personRoleService: PersonRoleService,
        private permissionService: PermissionService,
        private paymentService: PaymentService,
    ) {
    }

    async findByProject(projectId: number): Promise<Invoice[]> {
        return await this.invoiceRepository.find({
            relations: ['project', 'project.personProjects', 'project.personProjects.person'],
            where: {project: {id: projectId}}
        });
    }

    async findByPerson(personId: number): Promise<Invoice[]> {
        try {
            return await this.invoiceRepository.findByPerson(personId);
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async findOneByProject(projectId: number): Promise<Invoice> {
        const invoiceDb = await this.invoiceRepository.findOne({
            where: {project: {id: projectId}},
        });
        if (!invoiceDb) {
            throw new NotFoundException('Invoice not found.');
        }

        return invoiceDb;
    }

    async create(invoice: Invoice): Promise<Invoice> {
        try {
            const newInvoice = this.invoiceRepository.create(invoice);
            return await this.invoiceRepository.save(newInvoice);
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async findAll(personAuth: Person, roleId: number, filter?: InvoiceFilterInterface): Promise<ResponseListInterface<Invoice[]>> {
        const personRoleDb = await this.personRoleService.findByPersonAndRole(personAuth.id, roleId);
        if (!personRoleDb) {
            throw new ForbiddenException('Access denied.');
        }

        const permissionsRole = await this.permissionService.findByRole(roleId);
        if (permissionsRole.length == 0) {
            throw new ForbiddenException('Access denied');
        }

        return await this.invoiceRepository.findByPersonAndRole(personAuth, permissionsRole, filter);
    }

    async findOneForRole(invoiceId: number, personAuth: Person, roleId: number): Promise<Invoice> {
        return await this.invoiceRepository.findOneForRole(invoiceId, personAuth, roleId);
    }

    async findOne(invoiceId: number): Promise<Invoice> {
        return await this.invoiceRepository.findOne(invoiceId, {
            relations: ['fees', 'project'],
        })
    }

    async updateActive(invoiceId: number): Promise<Invoice> {
        const invoiceDb = await this.invoiceRepository.findOne(invoiceId);
        if (!invoiceDb) {
            throw new NotFoundException('Invoice not found.');
        }

        invoiceDb.active = !invoiceDb.active;
        return await this.invoiceRepository.save(invoiceDb);
    }

    async update(invoice: Invoice): Promise<Invoice> {
        const invoiceDb = await this.invoiceRepository.preload(invoice);
        if (!invoiceDb) {
            throw new NotFoundException('Invoice not found.');
        }

        return await this.invoiceRepository.save(invoiceDb);
    }

    async updateTotal(invoiceId: number, total: number): Promise<Invoice> {
        const invoice = await this.invoiceRepository.findOne(invoiceId, {
            relations: ['fees'],
            where: {active: true}
        });

        let totalPaidOut = 0;
        const paymentInvoice = await this.paymentService.findAllByInvoice(invoice.id);
        paymentInvoice.forEach((payment) => {
            if (payment.status == PaymentStatusEnum.VERIFIED && payment.active && !payment.deleted) {
                totalPaidOut += payment.amount
            }
        });

        if (!invoice) {
            throw new NotFoundException('Invoice not found.')
        }

        if (totalPaidOut > total) {
            throw new BadRequestException('No puede editar el precio total.')
        }

        if(invoice.status == InvoiceStatusEnum.PAID_OUT) {
            invoice.status = InvoiceStatusEnum.PARTIAL;
        }

        invoice.total = total;
        return await this.invoiceRepository.save(invoice);
    }
}
