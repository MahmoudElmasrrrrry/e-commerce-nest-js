import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Coupon } from 'src/coupon/coupon.schema';
import { Product } from 'src/product/product.schema';
import { User } from 'src/user/user.schema';

export type CartDocument = HydratedDocument<Cart>;

@Schema({ timestamps: true })
export class Cart {
  @Prop({
    type: [
      {
        product: { type: Types.ObjectId, ref: Product.name, required: true },
        quantity: { type: Number, default: 1 },
        color: String,
        price: Number,
      },
    ],
  })
  cartItems: {
    product: Types.ObjectId; 
    quantity: number;
    color: string;
    price: number;
  }[];

  @Prop({ type: Number, default: 0 }) 
  totalPrice: number;

  @Prop({ type: Number, default: 0 }) 
  totalAfterDiscount: number;

  @Prop({ type: Types.ObjectId, ref: User.name })
  user: Types.ObjectId;

  @Prop({
    type: [
      {
        couponId: { type: Types.ObjectId, ref: Coupon.name },
        name: String,
        discount: Number,
      },
    ],
  })
  coupons: {
    couponId: Types.ObjectId;
    name: string;
    discount: number;
  }[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
