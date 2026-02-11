// coupon.schema.ts
import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/user/user.schema';

export type CouponDocument = HydratedDocument<Coupon>;

@Schema({ timestamps: true })
export class Coupon {
  @Prop({
    type: String,
    required: true,
    unique: true, 
    trim: true,   
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [100, 'Name must be at most 100 characters'],
  })
  name: string;

  @Prop({
    type: Date,
    required: true,
  })
  expireDate: Date;

  @Prop({
    type: Number,
    required: true,
    min: [1, 'Discount must be at least 1%'],
    max: [100, 'Discount cannot exceed 100%'],
  })
  discount: number;

  @Prop({
    type: Number,
    default: 0,
    min: [0, 'Minimum order value cannot be negative'],
  })
  minOrderValue: number;

  @Prop({
    type: Number,
    default: null,
    min: [0, 'Maximum discount amount cannot be negative'],
  })
  maxDiscountAmount: number;

  @Prop({
    type: Boolean,
    default: true,
  })
  isActive: boolean;

  @Prop({
    type: Number,
    default: null,
    min: [1, 'Maximum usage must be at least 1'],
  })
  maxUsage: number;

  @Prop({
    type: Number,
    default: 0,
    min: [0, 'Used count cannot be negative'],
  })
  usedCount: number;

  @Prop({
    type: [{ type: Types.ObjectId, ref: User.name }],
    default: [],
  })
  usedBy: Types.ObjectId[];
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
export const CouponModel = MongooseModule.forFeature([
  {
    name: Coupon.name,
    schema: CouponSchema,
  },
]);