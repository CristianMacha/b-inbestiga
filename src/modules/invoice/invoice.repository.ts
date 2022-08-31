import {EntityRepository, Repository} from 'typeorm';
import {Invoice} from './invoice.entity';
import {Person} from "../person/person.entity";
import {Permission} from "../permission/permission.entity";
import {CPermission} from "../../core/enums/permission.enum";
import {InvoiceFilterInterface} from "../../core/interfaces/invoice.interface";
import {ResponseListInterface} from "../../core/interfaces/response.interface";

@EntityRepository(Invoice)
export class InvoiceRepository extends Repository<Invoice> {
    async findByPersonAndRole(person: Person, permissions: Permission[], filters?: InvoiceFilterInterface): Promise<ResponseListInterface<Invoice[]>> {
        const query = this.createQueryBuilder('invoice')
            .innerJoinAndSelect('invoice.project', 'project')
            .innerJoinAndSelect('project.personProjects', 'personProject')
            .innerJoinAndSelect('personProject.person', 'person')
            .where('project.deleted=false');

        if (filters.status !== 'ALL') {
            query.andWhere('invoice.status=:invoiceStatus', {invoiceStatus: filters.status});
        }

        permissions.forEach((permission) => {
            switch (permission.id) {
                case CPermission.P_INVOICE.LIST_ALL:
                    break;

                case CPermission.P_INVOICE.LIST_BY_PERSON:
                    query.andWhere('person.id=:personId', {personId: person.id});
                    break;

                default:
                    break;
            }
        });

        query.take(+filters.take);
        query.skip((+filters.skip) * (+filters.take));
        query.orderBy('invoice.updatedAt', 'DESC');
        return {data: await query.getMany(), total: await query.getCount()};
    }

    async findByPerson(personId: number): Promise<Invoice[]> {
        const query = this.createQueryBuilder('invoice')
            .innerJoinAndSelect('invoice.project', 'project')
            .innerJoin('project.personProjects', 'personProject')
            .innerJoin('personProject.person', 'person')
            .where('person.id=:personId', {personId})
            .andWhere('invoice.active=true');

        const listInvoice = await query.getMany();
        return listInvoice;
    }
}
