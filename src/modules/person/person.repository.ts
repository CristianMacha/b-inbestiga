import { EntityRepository, Repository } from 'typeorm';
import { Person } from './person.entity';

@EntityRepository(Person)
export class PersonRepository extends Repository<Person> {
  async findAllByRole(roleId: number): Promise<Person[]> {
    const query = this.createQueryBuilder('person')
      .innerJoinAndSelect('person.user', 'user')
      .innerJoin('person.personRoles', 'personRole')
      .innerJoin('personRole.role', 'role')
      .where('role.id=:roleId', { roleId });

    const result = await query.getMany();
    return result;
  }

  async findByCodeAndRole(code: string, roleId: number): Promise<Person> {
    const query = this.createQueryBuilder('person')
      .innerJoin('person.personRoles', 'personRole')
      .innerJoin('personRole.role', 'role')
      .where('person.code=:code', { code })
      .andWhere('role.id=:roleId', { roleId });

    const result = await query.getOne();
    return result;
  }
}
