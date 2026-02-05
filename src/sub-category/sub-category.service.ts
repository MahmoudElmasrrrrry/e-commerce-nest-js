import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { SubCategory } from './sub-category.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from 'src/category/category.schema';

@Injectable()
export class SubCategoryService {
  constructor(
    @InjectModel(SubCategory.name) private subCategoryModel: Model<SubCategory>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}
  async create(createSubCategoryDto: CreateSubCategoryDto) {
      const subCategoryExists = await this.subCategoryModel.findOne({
        name: createSubCategoryDto.name,
      });

      if (subCategoryExists) {
        throw new BadRequestException('SubCategory already exists');
      }

      const category = await this.categoryModel.findById(createSubCategoryDto.category);
      if (!category) {
        throw new BadRequestException('Category not found for the given category ID');
      }
  
      const subCategory = await this.subCategoryModel.create(createSubCategoryDto)
      await subCategory.populate('category', '-__v -_id');
      await subCategory.save();
      const { __v, ...subCategoryData } = subCategory.toObject();
  
      return {
        status: 'success',
        data: subCategoryData,
      };
    }
  
    async findAll() {
      const subCategories = await this.subCategoryModel.find().select('-__v').populate('category', '-__v -_id').exec();
      return {
        status: 'success',
        count: subCategories.length,
        data: subCategories,
      };
    }
  
    async findOne(id: Types.ObjectId) {
      const subCategory = await this.subCategoryModel
        .findById(id)
        .select('-__v')
        .populate('category', '-__v -_id')
        .exec();
      if (!subCategory) {
        throw new BadRequestException('SubCategory not found');
      }
      return {
        status: 'success',
        data: subCategory,
      };
    }
  
    async update(id: Types.ObjectId, updateSubCategoryDto: UpdateSubCategoryDto) {
      const subCategory = await this.subCategoryModel
        .findByIdAndUpdate(
          id,
          { ...updateSubCategoryDto },
          {
            new: true,
            runValidators: true,
          },
        )
        .select('-__v')
        .populate('category', '-__v -_id')
        .exec();
  
      if (!subCategory) {
        throw new BadRequestException('SubCategory not found');
      }
      return {
        status: 'success',
        data: subCategory,
      };
    }
  
    async remove(id: Types.ObjectId) {
      const subCategory = await this.subCategoryModel.findByIdAndDelete(id);
      if (!subCategory) {
        throw new BadRequestException('SubCategory not found');
      }
      return {
        status: 'success',
        message: 'SubCategory deleted successfully',
        data: null,
      };
    }
}
