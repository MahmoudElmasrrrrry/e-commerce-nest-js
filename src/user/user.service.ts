import { HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';


@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}



  // ========== Admin Services =========
  async create(createUserDto: CreateUserDto) {
    const ifUserExists = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (ifUserExists) {
      throw new HttpException('This email already exist', 409);
    }

    const user = {
      role: createUserDto.role || 'user',
    };

    await this.userModel.create({
      ...createUserDto,
      role: user.role,
      active: true,
    });

    const userdata = await this.userModel.findOne(
      { email: createUserDto.email },
      { password: 0, __v: 0 },
    );

    return {
      status: "success",
      data: userdata,
    };
  }


  // pagination, sorting, filtering
  async findAll(query: any) {
    let { limit = 10, skip = 0, sort = 'asc', name, email, role } = query;
    limit = parseInt(limit);
    skip = parseInt(skip);

    if (isNaN(limit) || isNaN(skip)) {
      throw new HttpException('Limit and Skip must be numbers', 400);
    }

    if (!['asc', 'desc'].includes(sort)) {
      throw new HttpException('Sort must be either asc or desc', 400);
    }

    //بناء الفلتر ديناميكيا (أهم خطوة)    --> ai tool
    const filters: any = {};

    if (name) {
      filters.name = { $regex: name, $options: 'i' };
    }
    if (email) {
      filters.email = { $regex: email, $options: 'i' };
    }
    if (role) {
      filters.role = role;
    }

    const users = await this.userModel
      .find(filters) 
      .skip(skip)
      .limit(limit)
      .sort({ name: sort === 'asc' ? 1 : -1 }) // Mongoose بيحب 1 و -1 أو 'asc'/'desc' --> ai tool
      .select('-password -__v') 
      .exec();

    return {
      status: 'success',
      length: users.length,
      data: users,
    };
  }
  
  async findOne(id: Types.ObjectId) {
    const user = await this.userModel.findById(id, { password: 0, __v: 0 });
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    return {
      status: "success",
      data: user,
    };
  }

  async update(id: Types.ObjectId, updateUserDto: UpdateUserDto) {

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { ...updateUserDto },
      { new: true, runValidators: true, select: { password: 0, __v: 0 } },
    );
    return {
      status: "success",
      data: updatedUser,
    };
  }

  async remove(id: Types.ObjectId) {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    await this.userModel.findByIdAndDelete(id);
    return {
      status: "success",
      data: null,
    };
  }


  // ========== User Services =========
  async getAccount(request: any) {
    const id = request.user._id;
    if(!id){
      throw new HttpException('User ID is required', 400);
    }

    const user = await this.userModel.findById(id, { password: 0, __v: 0 });
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    return {
      status: "success",
      data: user,
    };
  }

  async updateAccount(request: any, updateUserDto: UpdateUserDto) {
    const id = request.user._id;
    if(!id){
      throw new HttpException('User ID is required', 400);
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { ...updateUserDto },
      { new: true, runValidators: true, select: { password: 0, __v: 0 } },
    );

    return {
      status: "success",
      data: updatedUser,
    };
  }

  async deleteAccount(request: any) {
    const id = request.user._id;
    if(!id){
      throw new HttpException('User ID is required', 400);
    }
    await this.userModel.findByIdAndUpdate(id, { active: false });
    return {
      status: "success",
      data: null,
    };
  }

  
}