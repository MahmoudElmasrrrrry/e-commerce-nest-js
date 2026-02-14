import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, UseGuards, Req } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderPaidDto } from './dto/update-order-paid.dto';
import { Roles } from 'src/utils/decorator/roles.decorator';
import { Role } from 'src/utils/decorator/roles.enum';
import { AuthGuard } from 'src/utils/guard/Auth.guard';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}


  //docs    User can create Order
  //route   POST api/v1/Order
  //access  Private (User)
  @Post()
  @Roles([Role.User])
  @UseGuards(AuthGuard)
  create(@Req() req: any,@Body(new ValidationPipe({ whitelist: true, transform: true })) createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(req.user._id, createOrderDto);
  }

  //docs    User can get Order
  //route   POST api/v1/Order
  //access  Private (User)
  @Get()
  @Roles([Role.User])
  @UseGuards(AuthGuard)
  getOrder(@Req() req: any) {
    return this.orderService.getUserOrders(req.user._id);
  }



  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderPaidDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}
