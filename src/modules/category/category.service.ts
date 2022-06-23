import { BadRequestException, Injectable } from '@nestjs/common';
import { Category } from './category.entity';
import { CategoryRepository } from './category.repository';

@Injectable()
export class CategoryService {
    constructor(private categoryRepository: CategoryRepository) {}

    async create(category: Category): Promise<Category> {
        try {
            const newCategory = this.categoryRepository.create(category);
            const newCategoryCreated = await this.categoryRepository.save(newCategory);
            return newCategoryCreated;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async findAll(): Promise<Category[]> {
        try {
            const listCategory = await this.categoryRepository.find({ where: { active: true }});
            return listCategory;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }
}
