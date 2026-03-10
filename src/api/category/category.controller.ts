import { Body, Controller, Get, Post } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Auth } from 'src/api/auth/guards/auth.decorator';
import { RoleIds } from 'src/api/role/enum/role.enum';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  list() {
    return this.categoryService.findAll();
  }

  @Auth(RoleIds.Admin)
  @Post()
  create(@Body() body: CreateCategoryDto) {
    return this.categoryService.create(body.id, body.name);
  }
}
