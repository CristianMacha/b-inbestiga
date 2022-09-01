import {Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards} from '@nestjs/common';
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

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Invoice> {
        return await this.invoiceServices.findOne(+id);
    }

    @Get('update/active/:id')
    async updateActive(@Param('id') invoiceId: string): Promise<Invoice> {
        return await this.invoiceServices.updateActive(+invoiceId);
    }

    @Put()
    async update(@Body() invoice: Invoice): Promise<Invoice> {
        return await this.invoiceServices.update(invoice);
    }
}
