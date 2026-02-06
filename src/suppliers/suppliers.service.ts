import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Suppliers } from './suppliers.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectModel(Suppliers.name) private readonly suppliersModel:Model<Suppliers>,
  ) {}
  async create(createSupplierDto: CreateSupplierDto) {
    const isExists = await this.suppliersModel.findOne({ name: createSupplierDto.name });
    if(isExists){
      throw new BadRequestException('Supplier with this name already exists');
    }

    const supplier = await this.suppliersModel.create(createSupplierDto);
    const {__v, ...supplierCreated} = supplier.toObject();
    return {
      status: 'success',
      message: 'Supplier created successfully',
      data: supplierCreated,
    };
  }

  async findAll() {
    const suppliers = await this.suppliersModel.find().select('-__v');
    return {
      status: 'success',
      message: 'Suppliers retrieved successfully',
      count: suppliers.length,
      data: suppliers,
    };
  }

  async findOne(id: Types.ObjectId) {
    const supplier = await this.suppliersModel.findById(id).select('-__v');
    if (!supplier) {
      throw new BadRequestException('Supplier not found');
    }
    return {
      status: 'success',
      message: 'Supplier retrieved successfully',
      data: supplier,
    };
  }


  async update(id: Types.ObjectId, updateSupplierDto: UpdateSupplierDto) {
    const isExists = await this.suppliersModel.findById(id);
    if (!isExists) {
      throw new BadRequestException('Supplier not found');
    }

    if(updateSupplierDto.name){
      if(isExists.name === updateSupplierDto.name){
        throw new BadRequestException('Supplier with this name already exists');
      }

      const nameExists = await this.suppliersModel.findOne({ name: updateSupplierDto.name });
      if(nameExists){
        throw new BadRequestException('Supplier with this name already exists');
      } 
    }


    await this.suppliersModel.findByIdAndUpdate(id, {...updateSupplierDto}, { new: true, runValidators: true });
    const supplierUpdated = await this.suppliersModel.findById(id).select('-__v');

    return {
      status: 'success',
      message: 'Supplier updated successfully',
      data: supplierUpdated,
    };
  }

  async remove(id: Types.ObjectId) {
    const supplier = await this.suppliersModel.findByIdAndDelete(id);
    if (!supplier) {
      throw new BadRequestException('Supplier not found');
    }
    return {
      status: 'success',
      message: 'Supplier removed successfully',
      data: null,
    };
  }
}
