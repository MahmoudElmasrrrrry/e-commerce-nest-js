import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Roles } from 'src/utils/decorator/roles.decorator';
import { Role } from 'src/utils/decorator/roles.enum';
import { AuthGuard } from 'src/utils/guard/Auth.guard';
import { Types } from 'mongoose';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  //docs    Admin can create a category
  //route   POST api/v1/category
  //access  Private (admin)

  @Post()
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  //docs    Admin or user can view all categories
  //route   GET api/v1/category
  //access  Private (admin, user)

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  //docs    Admin or user can view a specific category
  //route   GET api/v1/category/:id
  //access  Private (admin, user)
  @Get(':id')
  async findOne(@Param('id') id: Types.ObjectId) {
    return this.categoryService.findOne(id);
  }

  //docs    Admin can update a category
  //route   PATCH api/v1/category/:id
  //access  Private (admin only)

  @Patch(':id')
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  update(@Param('id') id: Types.ObjectId, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto);
  }


  //docs    Admin can delete a category
  //route   DELETE api/v1/category/:id
  //access  Private (admin only)
  @Delete(':id')
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  remove(@Param('id') id: Types.ObjectId) {
    return this.categoryService.remove(id);
  }
}
