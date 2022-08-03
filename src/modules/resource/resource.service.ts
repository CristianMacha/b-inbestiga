import { Injectable } from '@nestjs/common';
import {ResourceRepository} from "./resource.repository";
import {ResourceEntity} from "./resource.entity";

@Injectable()
export class ResourceService {
    constructor(private resourceRepository: ResourceRepository) {
    }

    async findByRole(roleId: number): Promise<ResourceEntity[]> {
        return await this.resourceRepository.findByRole(roleId);
    }
}
