import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Category } from './category.entity';
import { CategoryRepository } from './category.repository';

@Injectable()
export class CategoryService {
  constructor(private categoryRepository: CategoryRepository) {}

  async create(category: Category): Promise<Category> {
    try {
      const newCategory = this.categoryRepository.create(category);
      const newCategoryCreated = await this.categoryRepository.save(
        newCategory,
      );
      return newCategoryCreated;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAll(): Promise<Category[]> {
    try {
      const listCategory = await this.categoryRepository.find({
        where: { active: true },
      });
      return listCategory;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async updateActive(categoryId: number): Promise<Category> {
    try {
      const categoryDb = await this.categoryRepository.findOne(categoryId);
      if (!categoryDb) {
        throw new NotFoundException('Category not found.');
      }

      categoryDb.active = !categoryDb.active;
      const categoryUpdated = await this.categoryRepository.save(categoryDb);
      return categoryUpdated;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async update(category: Category): Promise<Category> {
    try {
      const categoryDb = await this.categoryRepository.preload(category);
      if (!categoryDb) {
        throw new NotFoundException('Category not found.');
      }

      const categoryUpdated = await this.categoryRepository.save(categoryDb);
      return categoryUpdated;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
