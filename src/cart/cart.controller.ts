import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UnauthorizedException,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/create-cart.dto';
import { Roles } from 'src/utils/decorator/roles.decorator';
import { Role } from 'src/utils/decorator/roles.enum';
import { AuthGuard } from 'src/utils/guard/Auth.guard';
import { Types } from 'mongoose';
import { UpdateCartItemDto } from './dto/update-cart.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  //docs    User can get cart
  //route   POST api/v1/cart
  //access  Private (user)

  @Get()
  @Roles([Role.User])
  @UseGuards(AuthGuard)
  async getLoggedUserCart(@Req() req: any) {
    return this.cartService.getLoggedUserCart(req.user._id);
  }

  //docs    User can add cart
  //route   POST api/v1/cart/:id
  //access  Private (user)
  @Post('/:productId')
  @Roles([Role.User])
  @UseGuards(AuthGuard)
  create(
    @Body() addToCartDto: AddToCartDto,
    @Param('productId') productId: Types.ObjectId,
    @Req() req: any,
  ) {
    return this.cartService.addToCart(productId, req.user._id, addToCartDto);
  }

  //docs    User can apply coupon
  //route   POST api/v1/cart
  //access  Private (user)
  @Patch('/apply-coupon')
  @Roles([Role.User])
  @UseGuards(AuthGuard)
  applyCoupon(
    @Req() req: any,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    applyCouponDTO: ApplyCouponDto,
  ) {
    return this.cartService.applyCoupon(
      req.user._id,
      applyCouponDTO.couponName,
    );
  }

  //docs    User can update cart item
  //route   PATCH api/v1/cart/:itemId
  //access  Private (user)
  @Patch(':itemId')
  @Roles([Role.User])
  @UseGuards(AuthGuard)
  updateCartItem(
    @Param('itemId') itemId: Types.ObjectId,
    @Body() updateCartItemDto: UpdateCartItemDto,
    @Req() req: any,
  ) {
    return this.cartService.updateCartItem(
      req.user._id,
      itemId,
      updateCartItemDto,
    );
  }

  //docs    User can clear cart
  //route   DELETE api/v1/cart
  //access  Private (user)
  @Delete()
  @Roles([Role.User])
  @UseGuards(AuthGuard)
  deleteCart(@Req() req: any) {
    return this.cartService.deleteCart(req.user._id);
  }
  //docs    User can remove coupon
  //route   DELETE api/v1/cart/remove-coupon
  //access  Private (user)
  @Delete('remove-coupon')
  @Roles([Role.User])
  @UseGuards(AuthGuard)
  removeCoupon(@Req() req: any) {
    return this.cartService.removeCoupon(req.user._id);
  }

  //docs    User can remove item
  //route   DELETE api/v1/cart/:id
  //access  Private (user)
  @Delete(':itemId')
  @Roles([Role.User])
  @UseGuards(AuthGuard)
  remove(@Param('itemId') itemId: Types.ObjectId, @Req() req: any) {
    return this.cartService.removeItem(req.user._id, itemId);
  }
}
