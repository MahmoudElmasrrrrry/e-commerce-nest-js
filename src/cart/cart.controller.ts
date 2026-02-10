import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UnauthorizedException, ValidationPipe, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Roles } from 'src/utils/decorator/roles.decorator';
import { Role } from 'src/utils/decorator/roles.enum';
import { AuthGuard } from 'src/utils/guard/Auth.guard';
import { Types } from 'mongoose';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  //docs    User can add cart
  //route   POST api/v1/cart/:id
  //access  Private (user)
  @Post('/:productId')
  @Roles([Role.User])
  @UseGuards(AuthGuard)
  create(@Body() addToCartDto: AddToCartDto,@Param('productId') productId: Types.ObjectId, @Req() req: any) {
    return this.cartService.addToCart(productId, req.user._id, addToCartDto);
  }

  @Get()
  findAll() {
    return this.cartService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cartService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
    return this.cartService.update(+id, updateCartDto);
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
