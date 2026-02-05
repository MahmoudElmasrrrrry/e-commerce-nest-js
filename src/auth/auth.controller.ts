import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, HttpCode, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginDto, signUpDto, verifyEmailDto } from './dto/create-auth.dto';

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
  async verifyEmail(@Body(new ValidationPipe({whitelist: true, transform:true})) verifyEmail: verifyEmailDto) {
    return await this.authService.verifyEmail(verifyEmail.email, verifyEmail.code);
  }
  
  //docs    User login
  //route   POST api/v1/auth/login
  //access  Public
  @Post('sign-in')
  @HttpCode(200)
  async signIn(@Body(new ValidationPipe({whitelist: true, transform:true})) loginAuthDto: loginDto) {
    return await this.authService.signIn(loginAuthDto);
  }

  
}
