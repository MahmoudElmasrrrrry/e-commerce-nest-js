import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, UseGuards, Req, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Model, Types } from 'mongoose';
import { User } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { AuthGuard } from './guard/Auth.guard';
import { Roles } from './decorator/roles.decorator';



// ========= Admin Routes =========
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService
  ) {}

  //docs    Admin can create user
  //route   POST api/v1/user
  //access  Private (admin only)
  @Post()
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  async create(
    @Body(new ValidationPipe({whitelist: true, transform:true}))
    createUserDto: CreateUserDto,
  ) {   
    return await this.userService.create(createUserDto);
  }


  //docs    Admin can get all users
  //route   GET api/v1/user
  //access  Private (admin only)
  @Get()
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  async findAll(@Query() query: any) {
    return await this.userService.findAll(query);
  }


  //docs    Admin can get single user by id
  //route   GET api/v1/user/:id
  //access  Private (admin only)
  @Get(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: Types.ObjectId) {
    return await this.userService.findOne(id);
  }


  //docs    Admin can update user by id
  //route   PATCH api/v1/user/:id
  //access  Private (admin only)
  @Patch(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: Types.ObjectId,
    @Body(new ValidationPipe({whitelist: true, transform:true}))
    updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.update(id, updateUserDto);
  }


  //docs    Admin can delete user by id
  //route   DELETE api/v1/user/:id
  //access  Private (admin only)
  @Delete(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: Types.ObjectId) {
    return await this.userService.remove(id);
  }
}


// ========= User Routes =========
@Controller('userMe')
export class UserMeController {
  constructor(
    private readonly userService: UserService
  ) {}

  //docs    User can get his profile
  //route   GET api/v1/userMe
  //access  Private (user and admin)
  @Get()
  @Roles(['user', 'admin'])
  @UseGuards(AuthGuard)
  async getMe(@Req() request: any) {
    return await this.userService.getAccount(request);
  }

  //docs    User can update his profile
  //route   PATCH api/v1/userMe
  //access  Private (user and admin)
  @Patch()
  @Roles(['user', 'admin'])
  @UseGuards(AuthGuard)
  async updateMe(
    @Req() request: any,
    @Body(new ValidationPipe({whitelist: true, transform:true}))
    updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.updateAccount(request, updateUserDto);
  }

  //docs    User can delete his account
  //route   DELETE api/v1/userMe
  //access  Private (user)
  @Delete()
  @Roles(['user'])
  @UseGuards(AuthGuard)
  async deleteMe(@Req() request: any) {
    return await this.userService.deleteAccount(request);
  }
}