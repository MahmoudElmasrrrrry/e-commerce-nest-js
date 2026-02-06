import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Brand } from './brand.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class BrandService {
  constructor(
    @InjectModel(Brand.name) private readonly brandModel:Model<Brand>,
  ) {}
  async create(createBrandDto: CreateBrandDto) {
    const brandExists = await this.brandModel.findOne({ name: createBrandDto.name });
    if(brandExists){
      throw new BadRequestException('Brand with this name already exists');
    }

    const brand = new this.brandModel(createBrandDto);
    await brand.save();
    return {
      status: 'success',
      message: 'Brand created successfully',
      data: brand,
    };
  }

  async findAll() {
    const brands = await this.brandModel.find().select('-__v');
    return {
      status: 'success',
      message: 'Brands retrieved successfully',
      data: brands,
    };
  }

  async findOne(id: Types.ObjectId) {
    const brand = await this.brandModel.findById(id).select('-__v');
    if (!brand) {
      throw new BadRequestException('Brand not found');
    }
    return {
      status: 'success',
      message: 'Brand retrieved successfully',
      data: brand,
    };
  }

  async update(id: Types.ObjectId, updateBrandDto: UpdateBrandDto) {
    const brand = await this.brandModel.findById(id);
    if (!brand) {
      throw new BadRequestException('Brand not found');
    }

    if(updateBrandDto.name){
      if(brand.name === updateBrandDto.name){
        throw new BadRequestException('SupBrandplier with this name already exists');
      }
      const nameExists = await this.brandModel.findOne({ name: updateBrandDto.name });
      if(nameExists){
        throw new BadRequestException('Brand with this name already exists');
      } 
    }
    
    const updatedBrand = await this.brandModel.findByIdAndUpdate(id, {...updateBrandDto}, { new: true, runValidators: true }).select('-__v');
    
    
    return {
      status: 'success',
      message: 'Brand updated successfully',
      data: updatedBrand,
    };
  }

  async remove(id: Types.ObjectId) {
    const brand = await this.brandModel.findByIdAndDelete(id);
    if (!brand) {
      throw new BadRequestException('Brand not found');
    }
    return {
      status: 'success',
      message: 'Brand removed successfully',
      data: null,
    };
  }
}
