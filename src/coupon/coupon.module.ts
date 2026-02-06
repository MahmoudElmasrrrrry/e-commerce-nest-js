import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { CouponModel } from './coupon.schema';

@Module({
  imports: [CouponModel],
  controllers: [CouponController],
  providers: [CouponService],
})
export class CouponModule {}
