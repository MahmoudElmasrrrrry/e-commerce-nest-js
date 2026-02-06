import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Tax } from './tax.shcema';
import { Model } from 'mongoose';

@Injectable()
export class TaxService {
  constructor(
    @InjectModel(Tax.name) private readonly taxModel: Model<Tax>,
  ){}
  async create(createTaxDto: CreateTaxDto) {
    const tax = await this.taxModel.findOne({});
    if (!tax) {
      // Create New Tax
      const newTax = await this.taxModel.findByIdAndUpdate(createTaxDto).select('-__v');
      return {
        status: 'success',
        message: 'Tax created successfully',
        data: newTax,
      };
    }
    // Update Tax
    if(createTaxDto.taxPrice === tax.taxPrice || createTaxDto.shippingPrice === tax.shippingPrice){
      throw new BadRequestException('The values are the same')
    }
    const updateTax = await this.taxModel
      .findOneAndUpdate({}, {...createTaxDto}, {
        new: true,
        runValidators: true
      })
      .select('-__v');
    return {
      status: 'success',
      message: 'Tax Updated successfully',
      data: updateTax,
    };
  }

  async get() {
    const tax = await this.taxModel.findOne({}).select('-__v');

    return {
      status: 'success',
      message: 'Tax retrieved successfully',
      data: tax,
    };
    }


  async reSet() {
    const tax = await this.taxModel.findOneAndUpdate({},{taxPrice: 0, shippingPrice: 0}).select('-__v');
    return{
      status: 'success',
      message: 'Tax reset successfully',
      data: tax,
    }
  }
}
