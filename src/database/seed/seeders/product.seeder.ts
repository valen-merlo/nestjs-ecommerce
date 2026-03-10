import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryIds } from 'src/database/entities/category.entity';
import { Product, VariationTypes } from 'src/database/entities/product.entity';
import { Repository } from 'typeorm';
import { SeederInterface } from '../seeder.interface';

@Injectable()
export class ProductSeeder implements SeederInterface {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async seed() {
    const products = this.generateData();
    for (const p of products) {
      const existing = await this.productRepository.findOne({
        where: { code: p.code },
      });
      if (!existing) {
        await this.productRepository.save(this.productRepository.create(p));
      }
    }
  }

  private generateData(): Partial<Product>[] {
    return [
      {
        title: 'Laptop de ejemplo',
        code: 'SEED-LAPTOP-001',
        variationType: VariationTypes.NONE,
        description: 'Producto de ejemplo para el catálogo.',
        about: ['Ejemplo de producto'],
        details: null,
        isActive: true,
        merchantId: 1,
        categoryId: CategoryIds.Computers,
      },
      {
        title: 'Producto Fashion de ejemplo',
        code: 'SEED-FASHION-001',
        variationType: VariationTypes.NONE,
        description: 'Otro producto de ejemplo.',
        about: ['Ejemplo'],
        details: null,
        isActive: true,
        merchantId: 1,
        categoryId: CategoryIds.Fashion,
      },
    ];
  }
}
