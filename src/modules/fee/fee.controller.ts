import {Body, Controller, Get, Param, Post, Put, Req, UseGuards} from '@nestjs/common';

import {Fee} from './fee.entity';
import {FeeService} from './fee.service';
import {JwtAuthGuard} from "../../core/guards/jwt-auth.guard";

@Controller('fee')
export class FeeController {
    constructor(private feeServices: FeeService) {
    }

    @UseGuards(JwtAuthGuard)
    @Get('invoice/:id')
    async findByInvoice(@Param('id') invoiceId: string, @Req() req): Promise<Fee[]> {
        return await this.feeServices.findByInvoice(+invoiceId, req.user);
    }

    @Get('project/:id')
    async findByProject(@Param('id') projectId: string): Promise<Fee[]> {
        return await this.feeServices.findByProject(+projectId);
    }

    @Post()
    async create(@Body() fee: Fee): Promise<Fee> {
        return await this.feeServices.create(fee);
    }

    @Get()
    async findAll(): Promise<Fee[]> {
        return await this.feeServices.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Fee> {
        return await this.feeServices.findOne(+id);
    }

    @Get('update/active/:id')
    async updateActive(@Param('id') feeId: string): Promise<Fee> {
        return await this.feeServices.updateActive(+feeId);
    }
}
