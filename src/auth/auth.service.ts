import { HttpException, Injectable } from '@nestjs/common';
import { loginDto, signUpDto } from './dto/create-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/user/user.schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { comparing, hashing } from 'src/utils/security/bcrypt';
import { EmailType, Role } from 'src/utils/decorator/roles.enum';
import { createOTP } from 'src/utils/email/createOTP';
import { template } from 'src/utils/email/generateHTML';
import { emailEvent } from 'src/utils/email/email.events';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}
  async signUp(signUpDto: signUpDto) {
    const isUserExist = await this.userModel.findOne({
      email: signUpDto.email,
    });

    if (isUserExist) {
      throw new HttpException('User already exists', 409);
    }

    const otp = createOTP();
    
    const user = await this.userModel.create({
      ...signUpDto,
      role: signUpDto.role || Role.User,
      verificationCode: {
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        code: hashing(otp)
      },
    });

    const html = template({
      otp,
      name: user.name,
      subject: 'Verify your email',
    })

    emailEvent.publish(EmailType.VERIFY_EMAIL as any,{
      to: user.email,
      subject: 'Verify your email',
      html,
    })


    return {
      status: 'success',
      message: 'User created successfully, please check your email to verify your account',
    };
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new HttpException('Invalid email', 400);
    }

    if(user.active){
      throw new HttpException('Email already verified', 400);
    }
    
    if(!user.verificationCode.code){
      throw new HttpException('No verification code found, please request a new one', 400);
    }
    
    if (user.verificationCode.expiresAt && (user.verificationCode.expiresAt < new Date())) {
      throw new HttpException('Verification code expired', 400);
    }

    const isMatched = comparing(code, user.verificationCode.code);
    if(!isMatched){
      throw new HttpException('Invalid verification code', 400);
    }

    await this.userModel.updateOne(
      { email },
      {
         $set: { 
          active: true,
         },
         $unset: {
          verificationCode: 1 
        } },
    );

    return {
      status: 'success',
      message: 'Email verified successfully, you can now sign in to your account',
    };
  }
  
  async signIn(loginDto: loginDto) {
    const user = await this.userModel.findOne({ email: loginDto.email });
    if (!user) {
      throw new HttpException('Invalid credentials', 401);
    }
    

    const isPasswordValid = comparing(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', 401);
    }

    const payload = {
      _id: user._id,
      email: user.email,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    });

    return {
      status: 'success',
      data: {
        token,
      },
    };
  }
}
