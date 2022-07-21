import {EntityRepository, Repository} from 'typeorm';
import {Invoice} from './invoice.entity';
import {Person} from "../person/person.entity";
import {Permission} from "../permission/permission.entity";

@EntityRepository(Invoice)
export class InvoiceRepository extends Repository<Invoice> {
    // async findByPersonAndRole(person: Person, permissions: Permission[]): Promise<Invoice[]> {
    //     const query = this.createQueryBuilder('invoice')
    //         .innerJoin('invoice.project', 'project')
    //         .innerJoin('project.personProjects', 'personProject')
    //         .innerJoin('personProject.person', 'person');
    // }

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
