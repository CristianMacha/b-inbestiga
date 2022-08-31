import {EntityRepository, Repository} from 'typeorm';
import {Person} from './person.entity';
import {PersonFilterInterface} from "../../core/interfaces/person.interface";
import {ResponseListInterface} from "../../core/interfaces/response.interface";

@EntityRepository(Person)
export class PersonRepository extends Repository<Person> {
    /**
     * Find all by filter
     * @param personFilter
     */
    async findAll(personFilter: PersonFilterInterface): Promise<ResponseListInterface<Person[]>> {
        const query = this.createQueryBuilder('person')
            .innerJoinAndSelect('person.personRoles', 'personRole')
            .innerJoinAndSelect('personRole.role', 'role')
            .innerJoinAndSelect('person.user', 'user')
            .where('user.deleted=false')

        if (+personFilter.roleId !== 0) {
            query.andWhere('role.id=:roleId', {roleId: personFilter.roleId});
        }

        query.take(+personFilter.take);
        query.skip((+personFilter.skip) * (+personFilter.take));
        query.orderBy('person.updatedAt', 'DESC');
        return {data: await query.getMany(), total: await query.getCount()}
    }

    async findAllByRole(roleId: number): Promise<Person[]> {
        const query = this.createQueryBuilder('person')
            .innerJoinAndSelect('person.user', 'user')
            .innerJoin('person.personRoles', 'personRole')
            .innerJoin('personRole.role', 'role')
            .where('role.id=:roleId', {roleId});

        const result = await query.getMany();
        return result;
    }

    async findByCodeAndRole(code: string, roleId: number): Promise<Person> {
        const query = this.createQueryBuilder('person')
            .innerJoin('person.personRoles', 'personRole')
            .innerJoin('personRole.role', 'role')
            .where('person.code=:code', {code})
            .andWhere('role.id=:roleId', {roleId});

        const result = await query.getOne();
        return result;
    }

    /**
     * Find persons by nameValue and role
     * @param nameValue
     * @param roleId
     */
    async findByNameAndRole(nameValue: string, roleId: number): Promise<Person[]> {
        const query = this.createQueryBuilder('person')
            .innerJoin('person.personRoles', 'personRole')
            .innerJoin('personRole.role', 'role')
            .where('person.fullname LIKE :nameValue', {nameValue: `%${nameValue}%`})
            .andWhere('person.active=true')
            .andWhere('role.id=:roleId', {roleId});

        return await query.getMany();
    }
}
