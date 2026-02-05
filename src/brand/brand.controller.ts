import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ValidationPipe } from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { AuthGuard } from 'src/utils/guard/Auth.guard';
import { Role } from 'src/utils/decorator/roles.enum';
import { Roles } from 'src/utils/decorator/roles.decorator';
import { Types } from 'mongoose';

@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}


  //docs    Admin can create a brand
  //route   POST api/v1/brand
  //access  Private (admin)
  @Post()
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  create(@Body(new ValidationPipe({ whitelist: true, transform: true })) createBrandDto: CreateBrandDto) {
    return this.brandService.create(createBrandDto);
  }


  //docs    All users can get all brands
  //route   GET api/v1/brand
  //access  Private (admin, user)
  @Get()
  @Roles([Role.Admin, Role.User])
  @UseGuards(AuthGuard)
  findAll() {
    return this.brandService.findAll();
  }

  //docs    all users can get a brand by id
  //route   GET api/v1/brand/:id
  //access  Private (admin, user)
  @Get(':id')
  @Roles([Role.Admin, Role.User])
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: Types.ObjectId) {
    return this.brandService.findOne(id);
  }

  //docs    Admin can update a brand
  //route   PATCH api/v1/brand/:id
  //access  Private (admin)
  @Patch(':id')
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  update(@Param('id') id: Types.ObjectId, @Body(new ValidationPipe({ whitelist: true, transform: true })) updateBrandDto: UpdateBrandDto) {
    return this.brandService.update(id, updateBrandDto);
  }

  //docs    Admin can delete a brand
  //route   DELETE api/v1/brand/:id
  //access  Private (admin)
  
  @Delete(':id')
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  remove(@Param('id') id: Types.ObjectId) {
    return this.brandService.remove(id);
  }
}
