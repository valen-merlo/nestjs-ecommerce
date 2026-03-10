import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from 'src/database/entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      order: { id: 'ASC' },
    });
  }

  async create(id: number, name: string): Promise<Category> {
    const existing = await this.categoryRepository.findOne({ where: { id } });
    if (existing) {
      throw new ConflictException(`Ya existe una categoría con id ${id}`);
    }
    const category = this.categoryRepository.create({ id, name });
    return this.categoryRepository.save(category);
  }
}
