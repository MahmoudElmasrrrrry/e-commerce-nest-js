import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AddToCartDto } from './dto/create-cart.dto';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Cart } from './cart.schema';
import { Product } from 'src/product/product.schema';
import { Coupon } from 'src/coupon/coupon.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(Coupon.name) private readonly couponModel: Model<Coupon>,
  ) {}

  private async calculateCartTotal(cart: any) {
    let totalPrice = 0;
    let totalAfterDiscount = 0;

    cart.cartItems.forEach((item: any) => {
      if (item.product) {
        const quantity = item.quantity;
        const originalPrice = item.product.price;

        const discountPrice = item.product.priceAfterDiscount
          ? item.product.priceAfterDiscount
          : originalPrice;

        totalPrice += quantity * originalPrice;
        totalAfterDiscount += quantity * discountPrice;
      }
    });

    cart.totalPrice = totalPrice;
    cart.totalAfterDiscount = totalAfterDiscount;

    if (!cart.totalAfterDiscount) cart.totalAfterDiscount = cart.totalPrice;
  }

  private async reApplyCoupon(cart: any) {
    if (!cart.coupons || cart.coupons.length === 0) {
      return;
    }

    const couponId = cart.coupons[0];
    const coupon = await this.couponModel.findById(couponId);

    if (
      !coupon ||
      new Date(coupon.expireDate) < new Date() ||
      !coupon.isActive
    ) {
      cart.coupons = [];
      return;
    }

    let discount = (cart.totalAfterDiscount * coupon.discount) / 100;

    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }

    cart.totalAfterDiscount -= discount;

    if (cart.totalAfterDiscount < 0) {
      cart.totalAfterDiscount = 0;
    }
  }

  async addToCart(
    productId: Types.ObjectId,
    userId: Types.ObjectId,
    addToCartDto: AddToCartDto,
  ) {
    const { quantity, color }: AddToCartDto = addToCartDto;
    const quantityToAdd = quantity || 1;

    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Product not found');

    if (product.quantity < quantityToAdd) {
      throw new BadRequestException(
        `Out of stock. Only ${product.quantity} left.`,
      );
    }

    let cart = await this.cartModel.findOne({ user: userId });

    if (!cart) {
      cart = new this.cartModel({
        user: userId,
        cartItems: [],
        totalPrice: 0,
        totalAfterDiscount: 0,
      });
    }

    const itemIndex = cart.cartItems.findIndex(
      (item) =>
        item.product.toString() === productId.toString() &&
        item.color === color,
    );

    if (itemIndex > -1) {
      const newQuantity = cart.cartItems[itemIndex].quantity + quantityToAdd;
      if (newQuantity > product.quantity) {
        throw new BadRequestException(`Max stock reached. You can't add more.`);
      }
      cart.cartItems[itemIndex].quantity = newQuantity;
    } else {
      if (!product.colors.includes(color as string))
        throw new BadRequestException(
          `Color not available, please select another color. ${product.colors}`,
        );
      cart.cartItems.push({
        product: productId,
        quantity: quantityToAdd,
        color: color,
        price: product.price,
      } as any);
    }

    await cart.populate({
      path: 'cartItems.product',
      select:
        'title discription imageCover brand category price priceAfterDiscount',
      populate: {
        path: 'brand category',
        select: 'name',
      },
    });

    await this.calculateCartTotal(cart);
    await this.reApplyCoupon(cart);
    await cart.save();

    return {
      status: 'success',
      message: 'Cart updated successfully',
      numOfCartItems: cart.cartItems.length,
      data: cart,
    };
  }

  async removeItem(userId: Types.ObjectId, itemId: Types.ObjectId) {
    const cart = await this.cartModel.findOneAndUpdate(
      {
        user: userId,
        'cartItems._id': itemId,
      },
      {
        $pull: {
          cartItems: {
            _id: itemId,
          },
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!cart) throw new NotFoundException('Cart or Item not found');

    await cart.populate({
      path: 'cartItems.product',
      select: 'price priceAfterDiscount',
    });

    await this.calculateCartTotal(cart);
    await this.reApplyCoupon(cart);
    await cart.save();

    return {
      status: 'success',
      message: 'Cart updated successfully',
      numOfCartItems: cart.cartItems.length,
      data: cart,
    };
  }

  async getLoggedUserCart(userId: Types.ObjectId) {
    const cart = await this.cartModel.findOne({ user: userId }).populate({
      path: 'cartItems.product',
      select: 'title imageCover price priceAfterDiscount ratingsAverage',
    });

    if (!cart) {
      throw new NotFoundException('There is no cart for this user');
    }

    return {
      status: 'success',
      numOfCartItems: cart.cartItems.length,
      data: cart,
    };
  }

  async updateCartItem(
    userId: Types.ObjectId,
    itemId: Types.ObjectId,
    updateData: { quantity?: number; color?: string },
  ) {
    const cart = await this.cartModel.findOne({
      user: userId,
    });

    if (!cart) throw new NotFoundException('Cart not found');

    const itemIndex = cart.cartItems.findIndex(
      (item: any) => item._id.toString() === itemId.toString(),
    );

    if (itemIndex === -1) {
      throw new NotFoundException('Item not found in cart');
    }

    const cartItem = cart.cartItems[itemIndex];
    const product = await this.productModel.findById(cartItem.product);

    if (!product) throw new NotFoundException('Product not found');

    // Update quantity if provided
    if (updateData.quantity !== undefined) {
      if (updateData.quantity <= 0) {
        throw new BadRequestException('Quantity must be greater than 0');
      }

      if (updateData.quantity > product.quantity) {
        throw new BadRequestException(
          `Out of stock. Only ${product.quantity} available.`,
        );
      }

      cart.cartItems[itemIndex].quantity = updateData.quantity;
    }

    // Update color if provided
    if (updateData.color !== undefined) {
      if (!product.colors.includes(updateData.color)) {
        throw new BadRequestException(
          `Color not available. Available colors: ${product.colors.join(', ')}`,
        );
      }

      // Check if same product with new color already exists
      const duplicateIndex = cart.cartItems.findIndex(
        (item: any, idx) =>
          idx !== itemIndex &&
          item.product.toString() === cartItem.product.toString() &&
          item.color === updateData.color,
      );

      if (duplicateIndex > -1) {
        throw new BadRequestException(
          'This product with the selected color already exists in your cart',
        );
      }

      cart.cartItems[itemIndex].color = updateData.color;
    }

    await cart.populate({
      path: 'cartItems.product',
      select: 'title imageCover price priceAfterDiscount ratingsAverage',
    });

    await this.calculateCartTotal(cart);
    await this.reApplyCoupon(cart);
    await cart.save();

    return {
      status: 'success',
      message: 'Cart item updated successfully',
      numOfCartItems: cart.cartItems.length,
      data: cart,
    };
  }

  async deleteCart(userId: Types.ObjectId) {
    const cart = await this.cartModel.findOneAndUpdate(
      { user: userId },
      {
        cartItems: [],
        totalPrice: 0,
        totalAfterDiscount: 0,
      },
      {
        new: true,
        runValidators: true,
      },
    );
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    return {
      status: 'success',
      message: 'Cart deleted successfully',
      numOfCartItems: 0,
      data: null,
    };
  }

  async applyCoupon(userId: Types.ObjectId, couponName: string) {
    const cart = await this.cartModel.findOne({ user: userId });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    if (cart.cartItems.length === 0) {
      throw new BadRequestException('Cannot apply coupon to empty cart');
    }
    const coupon = await this.couponModel.findOne({ name: couponName });
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    if (!coupon.isActive) {
      throw new BadRequestException('Coupon is not active');
    }

    const expire = new Date(coupon.expireDate) < new Date();
    if (expire) {
      throw new BadRequestException('Coupon has already expired');
    }

    if (coupon.maxUsage && coupon.usedCount >= coupon.maxUsage) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    if (coupon.usedBy.some((user) => user.toString() === userId.toString())) {
      throw new BadRequestException('Coupon has already been used');
    }

    await cart.populate({
      path: 'cartItems.product',
      select: 'price priceAfterDiscount',
    });

    await this.calculateCartTotal(cart);
    if (cart.totalAfterDiscount < coupon.minOrderValue) {
      throw new BadRequestException(
        `Minimum order value is ${coupon.minOrderValue}. Your cart total is ${cart.totalAfterDiscount}`,
      );
    }

    let discount = (cart.totalAfterDiscount * coupon.discount) / 100;
    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }

    cart.totalAfterDiscount -= discount;

    if (cart.totalAfterDiscount < 0) {
      cart.totalAfterDiscount = 0;
    }

    cart.coupons = [coupon._id] as any;

    coupon.usedBy.push(userId);
    coupon.usedCount += 1;

    await coupon.save();
    await cart.save();

    return {
      status: 'success',
      message: 'Coupon applied successfully',
      data: {
        cart,
        appliedDiscount: `${coupon.discount}%`,
        savedAmount: discount,
      },
    };
  }

  async removeCoupon(userId: Types.ObjectId) {
    const cart = await this.cartModel.findOne({ user: userId });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    if (!cart.coupons || cart.coupons.length === 0) {
      throw new BadRequestException('No coupon applied to cart');
    }

    const cpnId = cart.coupons[0];
    const coupon = await this.couponModel.findById(cpnId);

    cart.coupons = [];

    await cart.populate({
      path: 'cartItems.product',
      select: 'price priceAfterDiscount',
    });

    await this.calculateCartTotal(cart);
    await cart.save();

    if (coupon) {
      coupon.usedBy = coupon.usedBy.filter(
        (user) => user.toString() !== userId.toString(),
      );
      coupon.usedCount -= 1;
      await coupon.save();
    }

    return {
      status: 'success',
      message: 'Coupon removed successfully',
      data: cart,
    };
  }
}
