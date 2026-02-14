import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order, OrderModel, OrderSchema } from './order.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from 'src/product/product.schema';
import { Tax, TaxSchema } from 'src/tax/tax.shcema';
import { User, UserSchema } from 'src/user/user.schema';
import { Cart, CartSchema } from 'src/cart/cart.schema';
import { Coupon, CouponSchema } from 'src/coupon/coupon.schema';

@Module({
  imports: [OrderModel,
    MongooseModule.forFeature([
      {
        name: Order.name,
        schema: OrderSchema
      },
      {
        name: Product.name,
        schema: ProductSchema
      },
      {
        name: Tax.name,
        schema: TaxSchema
      },
      {
        name: User.name,
        schema: UserSchema
      },
      {
        name: Cart.name,
        schema: CartSchema
      },
      {
        name: Coupon.name,
        schema: CouponSchema
      }
    ])
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
