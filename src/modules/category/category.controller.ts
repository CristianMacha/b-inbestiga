import {Body, Controller, Get, Param, Post, Put} from '@nestjs/common';
import {Category} from './category.entity';
import {CategoryService} from './category.service';

@Controller('category')
export class CategoryController {
    constructor(private categoryService: CategoryService) {
    }

    @Get('active')
    findAllActive(): Promise<Category[]> {
        return this.categoryService.findAllActive();
    }

    @Get('one/:id')
    findOne(@Param('id') categoryId: string): Promise<Category> {
        return this.categoryService.findOne(+categoryId);
    }

    @Post()
    async create(@Body() category: Category): Promise<Category> {
        return await this.categoryService.create(category);
    }

    @Get()
    async findAll(): Promise<Category[]> {
        return await this.categoryService.findAll();
    }

    @Get('update/active/:id')
    async updateActive(@Param('id') categoryId: string): Promise<Category> {
        return await this.categoryService.updateActive(+categoryId);
    }

    @Put()
    async update(@Body() category: Category): Promise<Category> {
        return await this.categoryService.update(category);
    }
}
