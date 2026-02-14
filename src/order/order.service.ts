import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderPaidDto } from './dto/update-order-paid.dto';
import { Order } from './order.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Tax } from 'src/tax/tax.shcema';
import { Product } from 'src/product/product.schema';
import { User } from 'src/user/user.schema';
import { Cart } from 'src/cart/cart.schema';
import { Coupon } from 'src/coupon/coupon.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(Coupon.name) private couponModel: Model<Coupon>,
    @InjectModel(Tax.name) private taxModel: Model<Tax>,
  ) {}
  async createOrder(userId: Types.ObjectId, createOrderDto: CreateOrderDto) {
    const cart = await this.cartModel.findOne({ user: userId }).populate({
      path: 'cartItems.product',
      select: 'title price priceAfterDiscount quantity sold',
    });

    if (!cart) {
      throw new BadRequestException('Cart not found');
    }

    if (cart.cartItems.length === 0) {
      throw new BadRequestException('Cannot create order from empty cart');
    }

    for (const item of cart.cartItems) {
      const product = await this.productModel.findById(item.product);
      if (!product) {
        throw new BadRequestException('Product not found');
      }

      if (product.quantity < item.quantity) {
        throw new BadRequestException(
          `Product "${product.title}" - Only ${product.quantity} available, you requested ${item.quantity}`,
        );
      }
    }

    const taxSetting = await this.taxModel.findOne({});
    const taxPrice = taxSetting?.taxPrice || 0;
    const shippingPrice = taxSetting?.shippingPrice || 0;

    const user = await this.userModel.findById(userId);
    const shippingAddress =
      createOrderDto.shippingAddress || user?.address || 'No Address Provided';

    const totalOrderPrice = cart.totalAfterDiscount + taxPrice + shippingPrice;

    const order = new this.orderModel({
      user: userId,
      cartItems: cart.cartItems,
      totalPrice: cart.totalPrice,
      totalAfterDiscount: cart.totalAfterDiscount,
      taxPrice: taxPrice,
      shippingPrice: shippingPrice,
      totalOrderPrice: totalOrderPrice,
      shippingAddress: shippingAddress,
      paymentMethod: createOrderDto.paymentMethod || 'cash',
    });

    for (const item of cart.cartItems) {
      const product = await this.productModel.findByIdAndUpdate(item.product, {
        $inc: {
          quantity: -item.quantity,
          sold: item.quantity,
        },
      });
    }

    await this.cartModel.findByIdAndUpdate(cart.id, {
      cartItems: [],
      totalPrice: 0,
      totalAfterDiscount: 0,
      coupons: [],
    });

    await order.save();
    
    return{
      status: 'success',
      message: 'Order created successfully',
      data: order,
    }
    
  }

  async getUserOrders(userId: Types.ObjectId) {
    const orders = await this.orderModel.find({ user: userId }).populate({
      path: 'cartItems.product',
      select: 'title imageCover price priceAfterDiscount sold quantity',
    }).sort({ createdAt: -1 });
    
    return{
      status: 'success',
      message: 'Orders fetched successfully',
      count: orders.length,
      data: orders,
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, UpdateOrderPaidDto: UpdateOrderPaidDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
