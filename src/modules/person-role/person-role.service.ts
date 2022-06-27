import { Injectable } from '@nestjs/common';
import { PersonRoleRepository } from './person-role.repository';

@Injectable()
export class PersonRoleService {
    constructor(private personRoleRepository: PersonRoleRepository) {}


}
