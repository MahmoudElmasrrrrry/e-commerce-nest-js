import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ValidationPipe } from '@nestjs/common';
import { SubCategoryService } from './sub-category.service';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { AuthGuard } from 'src/utils/guard/Auth.guard';
import { Role } from 'src/utils/decorator/roles.enum';
import { Roles } from 'src/utils/decorator/roles.decorator';
import { Types } from 'mongoose';

@Controller('sub-category')
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) {}

  //docs    Admin can create a sub-category
    //route   POST api/v1/sub-category
    //access  Private (admin)
  
    @Post()
    @Roles([Role.Admin])
    @UseGuards(AuthGuard)
    create(@Body(new ValidationPipe({ whitelist: true, transform: true })) createSubCategoryDto: CreateSubCategoryDto) {
      return this.subCategoryService.create(createSubCategoryDto);
    }
  
    //docs    Admin or user can view all sub-categories
    //route   GET api/v1/sub-category
    //access  Private (admin, user)
  
    @Get()
    findAll() {
      return this.subCategoryService.findAll();
    }
  
    //docs    Admin or user can view a specific sub-category
    //route   GET api/v1/sub-category/:id
    //access  Private (admin, user)
    @Get(':id')
    async findOne(@Param('id') id: Types.ObjectId) {
      return this.subCategoryService.findOne(id);
    }
  
    //docs    Admin can update a sub-category
    //route   PATCH api/v1/sub-category/:id
    //access  Private (admin only)
  
    @Patch(':id')
    @Roles([Role.Admin])
    @UseGuards(AuthGuard)
    update(@Param('id') id: Types.ObjectId, @Body(new ValidationPipe({ whitelist: true, transform: true })) updateSubCategoryDto: UpdateSubCategoryDto) {
      return this.subCategoryService.update(id, updateSubCategoryDto);
    }
  
  
    //docs    Admin can delete a sub-category
    //route   DELETE api/v1/sub-category/:id
    //access  Private (admin only)
    @Delete(':id')
    @Roles([Role.Admin])
    @UseGuards(AuthGuard)
    remove(@Param('id') id: Types.ObjectId) {
      return this.subCategoryService.remove(id);
    }
}
