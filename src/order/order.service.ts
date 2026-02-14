import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

    return {
      status: 'success',
      message: 'Order created successfully',
      data: order,
    };
  }

  async getUserOrders(userId: Types.ObjectId) {
    const orders = await this.orderModel
      .find({ user: userId })
      .populate({
        path: 'cartItems.product',
        select: 'title imageCover price priceAfterDiscount sold quantity',
      })
      .sort({ createdAt: -1 });

    return {
      status: 'success',
      message: 'Orders fetched successfully',
      count: orders.length,
      data: orders,
    };
  }

  async getSpecificOrder(id: Types.ObjectId, userId: Types.ObjectId) {
    const order = await this.orderModel.findById(id).populate({
      path: 'cartItems.product',
      select: 'title imageCover price priceAfterDiscount sold quantity',
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.user.toString() !== userId.toString()) {
      throw new BadRequestException('You are not allowed to access this order');
    }

    return {
      status: 'success',
      message: 'Order fetched successfully',
      data: order,
    };
  }

  async updateOrderToDelevered(id: Types.ObjectId) {
    const order = await this.orderModel.findById(id);
    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.iscanceled) {
      throw new BadRequestException(
        'You can not deliver this order because it is canceled',
      );
    }

    if (!order.isPaid) {
      throw new BadRequestException(
        'You can not deliver this order because it is not paid',
      );
    }

    if (order.isDelivered) {
      throw new BadRequestException(
        'You can not deliver this order because it is already delivered',
      );
    }

    order.isDelivered = true;
    order.deliveredAt = new Date();
    await order.save();

    return {
      status: 'success',
      message: 'Order delivered successfully',
      data: order,
    };
  }

  async updateOrderToPaid(
    orderId: Types.ObjectId,
    updateOrderPaidDto: UpdateOrderPaidDto,
  ) {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.iscanceled) {
      throw new BadRequestException('Cannot mark a cancelled order as paid');
    }

    if (order.isPaid) {
      throw new BadRequestException('Order is already paid');
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: updateOrderPaidDto.id,
      status: updateOrderPaidDto.status,
      update_time: new Date(),
      email_address: updateOrderPaidDto.email_address || '',
    };

    await order.save();
    

    return {
      status: 'success',
      message: 'Order marked as paid successfully',
      data: order,
    };
  }

  async getAllOrders(filters?:{
    isPaid?: boolean;
    isDelivered?: boolean;
    iscanceled?: boolean;
    page?: number;
    limit?: number;
  }) {
    
    const query: any = {};
    if (filters?.isPaid !== undefined) {
      query.isPaid = filters.isPaid;
    }
    if (filters?.isDelivered !== undefined) {
      query.isDelivered = filters.isDelivered;
    }
    if (filters?.iscanceled !== undefined) {
      query.iscanceled = filters.iscanceled;
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const orders = await this.orderModel.find(query).populate({
      path: 'user',
      select: 'name email phoneNumber',
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const totalOrders = await this.orderModel.countDocuments(query);
    
    return {
      status: 'success',
      message: 'Orders fetched successfully',
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalItems: totalOrders,
      },
      data: orders,
    };
  }


async getOrderStats() {
  const totalOrders = await this.orderModel.countDocuments();

  const pendingOrders = await this.orderModel.countDocuments({ isPaid: false, isCancelled: false });
  const paidOrders = await this.orderModel.countDocuments({ isPaid: true, isDelivered: false });
  const deliveredOrders = await this.orderModel.countDocuments({ isDelivered: true });
  const cancelledOrders = await this.orderModel.countDocuments({ isCancelled: true });

  const revenueResult = await this.orderModel.aggregate([
    { $match: { isPaid: true } },
    { $group: { _id: null, total: { $sum: '$totalOrderPrice' } } },
  ]);
  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

  return {
    status: 'success',
    data: {
      totalOrders,
      totalRevenue,
      ordersByStatus: {
        pending: pendingOrders,
        paid: paidOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
    },
  };
}

  async cancelOrder(id: Types.ObjectId, userId: Types.ObjectId) {
    const order = await this.orderModel.findById(id);
    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.user.toString() !== userId.toString()) {
      throw new BadRequestException('You are not allowed to access this order');
    }

    if (order.isPaid) {
      throw new BadRequestException(
        'You can not cancel this order because it is paid',
      );
    }

    if (order.isDelivered) {
      throw new BadRequestException(
        'You can not cancel this order because it is delivered',
      );
    }

    if (order.iscanceled) {
      throw new BadRequestException(
        'You can not cancel this order because it is already canceled',
      );
    }

    for (const item of order.cartItems) {
      await this.productModel.findByIdAndUpdate(item.product, {
        $inc: {
          quantity: item.quantity,
          sold: -item.quantity,
        },
      });
    }

    order.iscanceled = true;
    order.canceledAt = new Date();
    await order.save();

    return {
      status: 'success',
      message: 'Order cancelled successfully',
      data: order,
    };
  }
}
