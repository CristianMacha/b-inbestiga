import { EntityRepository, Repository } from 'typeorm';
import { Invoice } from './invoice.entity';

@EntityRepository(Invoice)
export class InvoiceRepository extends Repository<Invoice> {
  async findByPerson(personId: number): Promise<Invoice[]> {
    const query = this.createQueryBuilder('invoice')
      .innerJoinAndSelect('invoice.project', 'project')
      .innerJoin('project.personProjects', 'personProject')
      .innerJoin('personProject.person', 'person')
      .where('person.id=:personId', { personId });

    const listInvoice = await query.getMany();
    return listInvoice;
  }
}
