import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderPaidDto } from './dto/update-order-paid.dto';
import { Roles } from 'src/utils/decorator/roles.decorator';
import { Role } from 'src/utils/decorator/roles.enum';
import { AuthGuard } from 'src/utils/guard/Auth.guard';
import { Types } from 'mongoose';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // ----User Routes----

  //docs    User can create Order
  //route   POST api/v1/Order
  //access  Private (User)
  @Post()
  @Roles([Role.User])
  @UseGuards(AuthGuard)
  create(
    @Req() req: any,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    createOrderDto: CreateOrderDto,
  ) {
    return this.orderService.createOrder(req.user._id, createOrderDto);
  }

  //docs    User can get Order
  //route   GET api/v1/Order
  //access  Private (User)
  @Get()
  @Roles([Role.User])
  @UseGuards(AuthGuard)
  getOrder(@Req() req: any) {
    return this.orderService.getUserOrders(req.user._id);
  }

  //docs    Admin can get all Order
  //route   GET api/v1/Order
  //access  Private (Admin)
  @Get('admin/all')
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  getAllOrders(
    @Query('isPaid') isPaid?: string,
    @Query('isDelivered') isDelivered?: string,
    @Query('iscanceled') iscanceled?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters = {
      isPaid: isPaid === 'true' ? true : isPaid === 'false' ? false : undefined,
      isDelivered: isDelivered === 'true' ? true : isDelivered === 'false' ? false : undefined,
      iscanceled: iscanceled === 'true' ? true : iscanceled === 'false' ? false : undefined,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    }
    return this.orderService.getAllOrders(filters);
  }

  //docs    Admin can get all Order
  //route   GET api/v1/Order
  //access  Private (Admin)

  @Get('admin/stats')
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  getOrderStats() {
    return this.orderService.getOrderStats();
  }
  //docs    User can get specific Order
  //route   GET api/v1/Order/:id
  //access  Private (User)
  @Get(':id')
  @Roles([Role.User])
  @UseGuards(AuthGuard)
  getSpecificOrder(@Param('id') id: Types.ObjectId, @Req() req: any) {
    return this.orderService.getSpecificOrder(id, req.user._id);
  }

  



  //docs    Admin can update Order To Delevered
  //route   PATCH api/v1/Order/:id
  //access  Private (Admin)
  @Patch(':id/deliver')
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  updateOrderToDelevered(@Param('id') id: Types.ObjectId) {
    return this.orderService.updateOrderToDelevered(id);
  }


  
  //docs    Admin can update Order To Paid
  //route   PATCH api/v1/Order/:id
  //access  Private (Admin)
  @Patch(':id/paid')
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  updateOrderToPaid(
    @Param('id') id: Types.ObjectId,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    updateOrderPaidDto: UpdateOrderPaidDto,
  ) {
    return this.orderService.updateOrderToPaid(id, updateOrderPaidDto);
  }



  @Delete(':id')
  @Roles([Role.User])
  @UseGuards(AuthGuard)
  cancelOrder(@Param('id') id: Types.ObjectId, @Req() req: any) {
    return this.orderService.cancelOrder(id, req.user._id);
  }
}
