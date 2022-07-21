import {EntityRepository, Repository} from 'typeorm';
import {Invoice} from './invoice.entity';
import {Person} from "../person/person.entity";
import {Permission} from "../permission/permission.entity";
import {CPermission} from "../../core/enums/permission.enum";

@EntityRepository(Invoice)
export class InvoiceRepository extends Repository<Invoice> {
    async findByPersonAndRole(person: Person, permissions: Permission[]): Promise<Invoice[]> {
        const query = this.createQueryBuilder('invoice')
            .innerJoinAndSelect('invoice.project', 'project')
            .innerJoinAndSelect('project.personProjects', 'personProject')
            .innerJoinAndSelect('personProject.person', 'person')
            .where('project.deleted=false')

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

        query.orderBy('invoice.updatedAt', 'DESC');
        return await query.getMany();
    }

    async findByPerson(personId: number): Promise<Invoice[]> {
        const query = this.createQueryBuilder('invoice')
            .innerJoinAndSelect('invoice.project', 'project')
            .innerJoin('project.personProjects', 'personProject')
            .innerJoin('personProject.person', 'person')
            .where('person.id=:personId', {personId});

        const listInvoice = await query.getMany();
        return listInvoice;
    }
}
