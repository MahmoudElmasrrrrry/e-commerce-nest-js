import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, HttpCode, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { forgotPassword, loginDto, resendOTP, resetPassword, signUpDto, verifyEmailDto } from './dto/create-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //docs    User sign up
  //route   POST api/v1/auth/sign-up
  //access  Public
  @Post('sign-up')
  async signUp(@Body(new ValidationPipe({whitelist: true, transform:true})) signUpDto: signUpDto) {
    return await this.authService.signUp(signUpDto);
  }


  //docs    User verifiy email
  //route   POST api/v1/auth/verify-email
  //access  Public
  @Post('verify-email')
  @HttpCode(200)
  async verifyEmail(@Body(new ValidationPipe({whitelist: true, transform:true})) verifyEmail: verifyEmailDto) {
    return await this.authService.verifyEmail(verifyEmail.email, verifyEmail.code);
  }

  //docs    User resend otp
  //route   POST api/v1/auth/resend-otp
  //access  Public
  @Post('resend-otp')
  @HttpCode(200)
  async resendOTP(@Body(new ValidationPipe({whitelist: true, transform:true})) resendotp: resendOTP) {
    return await this.authService.resendOTP(resendotp.email);
  }
  
  //docs    User login
  //route   POST api/v1/auth/login
  //access  Public
  @Post('sign-in')
  @HttpCode(200)
  async signIn(@Body(new ValidationPipe({whitelist: true, transform:true})) loginAuthDto: loginDto) {
    return await this.authService.signIn(loginAuthDto);
  }

  //docs    User forget password
  //route   POST api/v1/auth/forgot-password
  //access  Public
  @Post('forgot-password')
  @HttpCode(200)
  async forgotpassword(@Body(new ValidationPipe({whitelist: true, transform:true})) forgotPass: forgotPassword) {
    return await this.authService.forgotPass(forgotPass.email);
  }
  //docs    User reset password
  //route   POST api/v1/auth/reset-password
  //access  Public
  @Post('reset-password')
  @HttpCode(200)
  async resetpassword(@Body(new ValidationPipe({whitelist: true, transform:true})) resetPass: resetPassword) {
    return await this.authService.resetPass(resetPass);
  }

  
}
