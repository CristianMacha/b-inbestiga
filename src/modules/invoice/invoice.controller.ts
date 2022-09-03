import {Body, Controller, Get, Param, Patch, Post, Put, Query, Req, UseGuards} from '@nestjs/common';
import {Invoice} from './invoice.entity';

import {InvoiceService} from './invoice.service';
import {JwtAuthGuard} from "../../core/guards/jwt-auth.guard";
import {InvoiceFilterInterface} from "../../core/interfaces/invoice.interface";
import {ResponseListInterface} from "../../core/interfaces/response.interface";

@Controller('invoice')
export class InvoiceController {
    constructor(private invoiceServices: InvoiceService) {
    }

    @Get('project/:id')
    async findByProject(@Param('id') projectId: string): Promise<Invoice[]> {
        return await this.invoiceServices.findByProject(+projectId);
    }

    @Get('person/:id')
    async findByPerson(@Param('id') personId: string): Promise<Invoice[]> {
        return await this.invoiceServices.findByPerson(+personId);
    }

    @Get('project/:id')
    async findOneByProject(@Param('id') projectId: string): Promise<Invoice> {
        return await this.invoiceServices.findOneByProject(+projectId);
    }

    @Post()
    async create(@Body() invoice: Invoice): Promise<Invoice> {
        return await this.invoiceServices.create(invoice);
    }

    @UseGuards(JwtAuthGuard)
    @Get('role/:id')
    async findAll(@Param('id') roleId: string, @Req() req, @Query() query: InvoiceFilterInterface): Promise<ResponseListInterface<Invoice[]>> {
        return await this.invoiceServices.findAll(req.user, +roleId, query);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string, @Req() req): Promise<Invoice> {
        return await this.invoiceServices.findOneForRole(+id, req.user, +req.headers.data);
    }

    @Get('update/active/:id')
    async updateActive(@Param('id') invoiceId: string): Promise<Invoice> {
        return await this.invoiceServices.updateActive(+invoiceId);
    }

    @Put()
    async update(@Body() invoice: Invoice): Promise<Invoice> {
        return await this.invoiceServices.update(invoice);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('total/:id')
    updateTotal(@Param('id') invoiceId: string, @Body() body: { total: number }): Promise<Invoice> {
        return this.invoiceServices.updateTotal(+invoiceId, body.total);
    }
}
