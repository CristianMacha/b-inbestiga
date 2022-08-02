import {Injectable} from '@nestjs/common';
import {RoleResourceRepository} from "./role-resource.repository";

@Injectable()
export class RoleResourceService {
    constructor(private roleResourceRepository: RoleResourceRepository) {
    }
}
