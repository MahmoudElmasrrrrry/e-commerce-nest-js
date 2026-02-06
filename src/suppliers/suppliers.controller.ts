import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ValidationPipe } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Roles } from 'src/utils/decorator/roles.decorator';
import { Role } from 'src/utils/decorator/roles.enum';
import { AuthGuard } from 'src/utils/guard/Auth.guard';
import { Types } from 'mongoose';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  //docs    Admin can Create a new supplier
  //route   POST api/v1/suppliers
  //access  Private (admin)
  @Post()
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  create(@Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.create(createSupplierDto);
  }

  //docs    Admin can view all suppliers
  //route   GET api/v1/suppliers
  //access  Private (admin)
  @Get()
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  findAll() {
    return this.suppliersService.findAll();
  }

  //docs    Admin can view a specific supplier
  //route   GET api/v1/suppliers/:id
  //access  Private (admin)
  @Get(':id')
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: Types.ObjectId) {
    return this.suppliersService.findOne(id);
  }

  //docs    Admin can update a supplier
  //route   PATCH api/v1/suppliers/:id
  //access  Private (admin)
  @Patch(':id')
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  update(@Param('id') id: Types.ObjectId, @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) updateSupplierDto: UpdateSupplierDto) {
    return this.suppliersService.update(id, updateSupplierDto);
  }

  //docs    Admin can delete a supplier
  //route   DELETE api/v1/suppliers/:id
  //access  Private (admin)
  @Delete(':id')
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  remove(@Param('id') id: Types.ObjectId) {
    return this.suppliersService.remove(id);
  }
}
