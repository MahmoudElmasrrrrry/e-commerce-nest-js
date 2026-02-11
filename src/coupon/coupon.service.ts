import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Coupon } from './coupon.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CouponService {
  constructor(
    @InjectModel(Coupon.name) private readonly couponModel: Model<Coupon>,
  ) {}
  async create(createCouponDto: CreateCouponDto) {
    const couponExists = await this.couponModel.findOne({
      name: createCouponDto.name,
    });
    if (couponExists) {
      throw new BadRequestException('Coupon with this name already exists');
    }

    const expired = new Date(createCouponDto.expireDate) < new Date();
    if (expired) {
      throw new BadRequestException('Coupon expire date must be in the future');
    }

    if (
      createCouponDto.minOrderValue !== undefined &&
      createCouponDto.minOrderValue < 0
    ) {
      throw new BadRequestException('Minimum order value cannot be negative');
    }

    if (
      createCouponDto.maxDiscountAmount !== undefined &&
      createCouponDto.maxDiscountAmount < 0
    ) {
      throw new BadRequestException(
        'Maximum discount amount cannot be negative',
      );
    }

    if (
      createCouponDto.maxUsage !== undefined &&
      createCouponDto.maxUsage < 1
    ) {
      throw new BadRequestException('Maximum usage must be at least 1');
    }

    const coupon = await this.couponModel.create(createCouponDto);
    const { __v, ...couponCreated } = coupon.toObject();

    return {
      status: 'success',
      message: 'Coupon created successfully',
      data: couponCreated,
    };
  }

  async findAll() {
    const coupons = await this.couponModel.find().select('-__v');
    return {
      status: 'success',
      message: 'Coupons retrieved successfully',
      count: coupons.length,
      data: coupons,
    };
  }

  async findOne(id: Types.ObjectId) {
    const coupon = await this.couponModel.findById(id).select('-__v');
    if (!coupon) {
      throw new BadRequestException('Coupon not found');
    }
    return {
      status: 'success',
      message: 'Coupon retrieved successfully',
      data: coupon,
    };
  }

  async update(id: Types.ObjectId, updateCouponDto: UpdateCouponDto) {
    const coupon = await this.couponModel.findById(id);
    if (!coupon) {
      throw new BadRequestException('Coupon not found');
    }

    if (updateCouponDto.name) {
      if (coupon.name !== updateCouponDto.name) {
        const nameExists = await this.couponModel.findOne({
          name: updateCouponDto.name,
        });
        if (nameExists) {
          throw new BadRequestException('Coupon with this name already exists');
        }
      }
    }

    if (updateCouponDto.expireDate) {
      const expired = new Date(updateCouponDto.expireDate) < new Date();
      if (expired) {
        throw new BadRequestException(
          'Coupon expiry date must be in the future',
        );
      }
    }

    if (updateCouponDto.discount !== undefined) {
      if (updateCouponDto.discount < 1 || updateCouponDto.discount > 100) {
        throw new BadRequestException('Discount must be between 1% and 100%');
      }
    }

    if (
      updateCouponDto.minOrderValue !== undefined &&
      updateCouponDto.minOrderValue < 0
    ) {
      throw new BadRequestException('Minimum order value cannot be negative');
    }

    if (
      updateCouponDto.maxDiscountAmount !== undefined &&
      updateCouponDto.maxDiscountAmount < 0
    ) {
      throw new BadRequestException(
        'Maximum discount amount cannot be negative',
      );
    }

    if (
      updateCouponDto.maxUsage !== undefined &&
      updateCouponDto.maxUsage < 1
    ) {
      throw new BadRequestException('Maximum usage must be at least 1');
    }

    const couponUpdated = await this.couponModel
      .findByIdAndUpdate(
        id,
        { ...updateCouponDto },
        { new: true, runValidators: true },
      )
      .select('-__v');

    return {
      status: 'success',
      message: 'Coupon updated successfully',
      data: couponUpdated,
    };
  }

  async remove(id: Types.ObjectId) {
    const coupon = await this.couponModel.findByIdAndDelete(id);
    if (!coupon) {
      throw new BadRequestException('Coupon not found');
    }
    return {
      status: 'success',
      message: 'Coupon removed successfully',
      data: null,
    };
  }
}
