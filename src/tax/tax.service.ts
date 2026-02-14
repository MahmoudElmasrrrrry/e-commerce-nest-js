import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTaxDto } from './dto/create-tax.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Tax } from './tax.shcema';
import { Model } from 'mongoose';

@Injectable()
export class TaxService {
  constructor(
    @InjectModel(Tax.name) private readonly taxModel: Model<Tax>,
  ) {}

  async create(createTaxDto: CreateTaxDto) {
    const tax = await this.taxModel.findOne({});
    
    if (!tax) {
      const newTax = await this.taxModel.create(createTaxDto);
      const { __v, ...taxData } = newTax.toObject();
      
      return {
        status: 'success',
        message: 'Tax created successfully',
        data: taxData,
      };
    }
    
    if (
      createTaxDto.taxPrice === tax.taxPrice &&
      createTaxDto.shippingPrice === tax.shippingPrice
    ) {
      throw new BadRequestException('The values are the same');
    }
    
    const updateTax = await this.taxModel
      .findOneAndUpdate(
        {},
        { ...createTaxDto },
        {
          new: true,
          runValidators: true,
        }
      )
      .select('-__v');
      
    return {
      status: 'success',
      message: 'Tax updated successfully',
      data: updateTax,
    };
  }

  async get() {
    let tax = await this.taxModel.findOne({}).select('-__v');
    
    if (!tax) {
      return {
        status: 'success',
        message: 'Tax retrieved successfully (default)',
        data: {
          taxPrice: 0,
          shippingPrice: 0,
        },
      };
    }
    
    return {
      status: 'success',
      message: 'Tax retrieved successfully',
      data: tax,
    };
  }

  async reset() {
    const tax = await this.taxModel
      .findOneAndUpdate(
        {},
        { taxPrice: 0, shippingPrice: 0 },
        { new: true }
      )
      .select('-__v');
      
    return {
      status: 'success',
      message: 'Tax reset successfully',
      data: tax,
    };
  }
}