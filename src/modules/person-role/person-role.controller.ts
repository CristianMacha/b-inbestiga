import {Controller, Get, Req, UseGuards} from '@nestjs/common';

import {PersonRoleService} from "./person-role.service";
import {JwtAuthGuard} from "../../core/guards/jwt-auth.guard";
import {PersonRole} from "./person-role.entity";

@Controller('person-role')
export class PersonRoleController {
    constructor(private personRoleService: PersonRoleService) {
    }

    @UseGuards(JwtAuthGuard)
    @Get('person')
    async findPersonRolesByUser(@Req() req): Promise<PersonRole[]> {
        return await this.personRoleService.findByPerson(req.user.person);
    }
}
