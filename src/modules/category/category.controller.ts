import { Body, Controller, Get, Post } from '@nestjs/common';
import { Category } from './category.entity';
import { CategoryService } from './category.service';

@Controller('category')
export class CategoryController {
    constructor(private categoryService: CategoryService) {}

    @Post()
    async create(@Body() category: Category): Promise<Category> {
        return await this.categoryService.create(category);
    }

    @Get()
    async findAll(): Promise<Category[]> {
        return await this.categoryService.findAll();
    }
}
