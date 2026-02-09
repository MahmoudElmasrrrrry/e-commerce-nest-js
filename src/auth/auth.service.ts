import { BadRequestException, ConflictException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { loginDto, forgotPassword, signUpDto, resetPassword } from './dto/create-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/user/user.schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { comparing, hashing } from 'src/utils/security/bcrypt';
import { EmailType, Role } from 'src/utils/decorator/roles.enum';
import { createOTP } from 'src/utils/email/createOTP';
import { template } from 'src/utils/email/generateHTML';
import { EMAIL_EVENTS_Enum, emailEvent } from 'src/utils/email/email.events';
import { Subject } from 'rxjs';

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

    emailEvent.publish(EMAIL_EVENTS_Enum.VERIFY_EMAIL,{
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
    
    if(!user.verificationCode?.code){
      throw new HttpException('No verification code found, please request a new one', 400);
    }
    
    if (user.verificationCode?.expiresAt && (user.verificationCode?.expiresAt < new Date())) {
      throw new HttpException('Verification code expired', 400);
    }

    const isMatched = comparing(code, user.verificationCode?.code);
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

  async resendOTP(email: string){
    const user = await this.userModel.findOne({email});
    if(!user){
      throw new NotFoundException('User Not Found');
    }

    if(user.active){
      throw new BadRequestException('User Already Verefied');
    }

    if(!user.verificationCode?.code){
      throw new NotFoundException('No OTP found, please request a new one')
    }

    const expired = user.verificationCode?.expiresAt && (user.verificationCode?.expiresAt < new Date()) 
    if (!expired) {
      throw new ConflictException('Verification code still valid');
    }

    const otp = createOTP();
    const html = template({
      otp,
      name: user.name, 
      subject: "OTP Verification"
    })

    emailEvent.publish(EMAIL_EVENTS_Enum.VERIFY_EMAIL, {
      to: email,
      Subject: "Resend OTP",
      html
    });

    await this.userModel.updateOne(
      {email},
      {
      $set:{
        verificationCode:{
          code: hashing(otp),
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          }
        }
      }
  )

    return{
      status: 'success',
      message:'OTP Send Successfully',
      data: null
    }
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

  async forgotPass(email: string){
    const user = await this.userModel.findOne({email});
    if(!user){
      throw new NotFoundException('User Not Found');
    }

    if(!user.active){
      throw new BadRequestException('User Not Verefied, You should be vetify email first');
    }

    if(user.verificationCode){
      const expired = user.verificationCode.expiresAt && (user.verificationCode.expiresAt < new Date()) 
      if (!expired) {
        throw new ConflictException('Verification code still valid');
      }   
    }

    const otp = createOTP();
    const html = template({
      otp: otp,
      name: user.name,
      subject: "Reset Password",
    });

    emailEvent.publish(EMAIL_EVENTS_Enum.RESET_PASSWORD, {
      to: email,
      subject: "Reset your password",
      html,
    });

    await this.userModel.updateOne({email}, {
      verificationCode:{
        code: hashing(otp),
        expiresAt:new Date(Date.now() + 10 * 60 * 1000)
      }
    })

    return {
      status:'success',
      message: 'OTP reset password sent successfully',
      data: null
    }
    
    
  }

  async resetPass(resetPassword : resetPassword){
    
    const user = await this.userModel.findOne({email: resetPassword.email});

    if (!user) {
      throw new HttpException('Invalid email', 400);
    }

    if(!user.active){
      throw new HttpException('User Not Verefied, You should be vetify email first', 400);
    }
    
    if(!user.verificationCode?.code){
      throw new HttpException('No verification code found, please click forget password to get new OTP', 400);
    }
    
    if (user.verificationCode?.expiresAt && (user.verificationCode?.expiresAt < new Date())) {
      throw new HttpException('Verification code expired', 400);
    }

    const isMatched = comparing(resetPassword.code, user.verificationCode?.code);
    if(!isMatched){
      throw new HttpException('Invalid verification code', 400);
    }

    await this.userModel.updateOne({email: resetPassword.email}, 
      {

        $set:{
          password: resetPassword.newPassword
        },
        $unset:{
          verificationCode: 1
        }
      
      });
    return {
      status: 'success',
      message:'New Password Created Successfully',
      data: null
    }

  }
}
