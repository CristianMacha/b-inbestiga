import {Controller, Get, Param} from '@nestjs/common';
import {ResourceService} from "./resource.service";
import {ResourceEntity} from "./resource.entity";

@Controller('resource')
export class ResourceController {
    constructor(private resourceService: ResourceService) {
    }

    @Get('role/:id')
    async findByRole(@Param('id') roleId: string): Promise<ResourceEntity[]> {
        return await this.resourceService.findByRole(+roleId);
    }
}
