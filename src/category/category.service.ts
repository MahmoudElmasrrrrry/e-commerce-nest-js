import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category } from './category.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}
  async create(createCategoryDto: CreateCategoryDto) {
    const categoryExists = await this.categoryModel.findOne({
      name: createCategoryDto.name,
    });
    if (categoryExists) {
      throw new BadRequestException('Category already exists');
    }

    const category = await this.categoryModel.create(createCategoryDto);
    await category.save();

    const { __v, ...categoryData } = category.toObject();

    return {
      status: 'success',
      data: categoryData,
    };
  }

  async findAll() {
    const categories = await this.categoryModel.find().select('-__v').exec();
    return {
      status: 'success',
      count: categories.length,
      data: categories,
    };
  }

  async findOne(id: Types.ObjectId) {
    const category = await this.categoryModel
      .findById(id)
      .select('-__v')
      .exec();
    if (!category) {
      throw new BadRequestException('Category not found');
    }
    return {
      status: 'success',
      data: category,
    };
  }

  async update(id: Types.ObjectId, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    if(updateCategoryDto.name){
      if(category.name === updateCategoryDto.name){
        throw new BadRequestException('Category with this name already exists');
      }
      const nameExists = await this.categoryModel.findOne({ name: updateCategoryDto.name });
      if(nameExists){
        throw new BadRequestException('Category with this name already exists');
      } 
    }
    const updatedcategory = await this.categoryModel
      .findByIdAndUpdate(
        id,
        { ...updateCategoryDto },
        {
          new: true,
          runValidators: true,
        },
      )
      .select('-__v')
      .exec();

    return {
      status: 'success',
      data: updatedcategory,
    };
  }

  async remove(id: Types.ObjectId) {
    const category = await this.categoryModel.findByIdAndDelete(id);
    if (!category) {
      throw new BadRequestException('Category not found');
    }
    return {
      status: 'success',
      message: 'Category deleted successfully',
      data: null,
    };
  }
}
