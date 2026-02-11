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
    await cart.save();

    return {
      status: 'success',
      message: 'Cart item updated successfully',
      numOfCartItems: cart.cartItems.length,
      data: cart,
    };
  }
}
