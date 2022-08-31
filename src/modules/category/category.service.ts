import {Injectable, NotFoundException} from '@nestjs/common';
import {Category} from './category.entity';
import {CategoryRepository} from './category.repository';

@Injectable()
export class CategoryService {
    constructor(private categoryRepository: CategoryRepository) {
    }

    async findAllActive(): Promise<Category[]> {
        return await this.categoryRepository.find({
            where: {active: true}
        });
    }

    async create(category: Category): Promise<Category> {
        const newCategory = this.categoryRepository.create(category);
        return await this.categoryRepository.save(
            newCategory,
        );
    }

    async findAll(): Promise<Category[]> {
        return await this.categoryRepository.find({
            order: {updatedAt: 'DESC'}
        });
    }

    async updateActive(categoryId: number): Promise<Category> {
        const categoryDb = await this.categoryRepository.findOne(categoryId);
        if (!categoryDb) {
            throw new NotFoundException('Category not found.');
        }

        categoryDb.active = !categoryDb.active;
        return await this.categoryRepository.save(categoryDb);
    }

    async update(category: Category): Promise<Category> {
        const categoryDb = await this.categoryRepository.preload(category);
        if (!categoryDb) {
            throw new NotFoundException('Category not found.');
        }

        return await this.categoryRepository.save(categoryDb);
    }
}
