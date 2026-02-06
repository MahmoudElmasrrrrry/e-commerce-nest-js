import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Role } from 'src/utils/decorator/roles.enum';
import { Roles } from 'src/utils/decorator/roles.decorator';
import { AuthGuard } from 'src/utils/guard/Auth.guard';
import { Types } from 'mongoose';

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  //docs    Admin can create a coupon
  //route   POST api/v1/coupon
  //access  Private (admin)

  @Post()
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  create(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    createCouponDto: CreateCouponDto,
  ) {
    return this.couponService.create(createCouponDto);
  }

  //docs    Admin or user can view all coupons
  //route   GET api/v1/coupon
  //access  Private (admin, user)
  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.couponService.findAll();
  }

  //docs    Admin or user can view a specific coupon
  //route   GET api/v1/coupon/:id
  //access  Private (admin, user)
  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: Types.ObjectId) {
    return this.couponService.findOne(id);
  }

  //docs    Admin can update a coupon
  //route   PATCH api/v1/coupon/:id
  //access  Private (admin only)
  @Patch(':id')
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: Types.ObjectId,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    updateCouponDto: UpdateCouponDto,
  ) {
    return this.couponService.update(id, updateCouponDto);
  }

  //docs    Admin can delete a coupon
  //route   DELETE api/v1/coupon/:id
  //access  Private (admin only)
  @Delete(':id')
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  remove(@Param('id') id: Types.ObjectId) {
    return this.couponService.remove(id);
  }
}
