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

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

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

  //docs    User can get cart
  //route   POST api/v1/cart
  //access  Private (user)

  @Get()
  @Roles([Role.User])
  @UseGuards(AuthGuard)
  async getLoggedUserCart(@Req() req: any) {
    return this.cartService.getLoggedUserCart(req.user._id);
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
}
