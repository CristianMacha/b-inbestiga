import { Body, Controller, Get, Param, Patch, Post, Put, Req, UseGuards } from '@nestjs/common';

import { Fee } from './fee.entity';
import { FeeService } from './fee.service';
import { JwtAuthGuard } from "../../core/guards/jwt-auth.guard";

@Controller('fee')
export class FeeController {
    constructor(private feeServices: FeeService) {
    }

    @Patch('total/:id')
    async updateTotal(@Param('id') feeId: number, @Body() body: { total: number, paymentDate: Date, numberFee: number }): Promise<Fee> {
        return await this.feeServices.updateTotal(feeId, body);
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

    @Post('invoice/:id')
    async create(
        @Param('id') invoiceId: string,
        @Body() fee: Fee,
    ): Promise<Fee> {
        return await this.feeServices.create(+invoiceId, fee);
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
