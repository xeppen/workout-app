import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Get,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { SupabaseAuthGuard } from './supabase-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Post('register')
  async register(@Body() registerDto: { email: string; password: string }) {
    const { data, error } = await this.supabaseService.signUp(
      registerDto.email,
      registerDto.password
    );
    if (error) throw new HttpException(error.message, HttpStatus.BAD_REQUEST);

    return {
      message:
        'User registered successfully. Please check your email for verification.',
      user: data.user,
    };
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: { email: string; password: string }) {
    const { data, error } = await this.supabaseService.signInWithEmail(
      loginDto.email,
      loginDto.password
    );
    if (error) throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);

    return { message: 'Logged in successfully', session: data.session };
  }

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  getProfile(@Req() req) {
    return req.user;
  }

  @Post('logout')
  @UseGuards(SupabaseAuthGuard)
  async logout(@Req() req) {
    const { error } = await this.supabaseService.signOut(req.user.id);
    if (error)
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    return { message: 'Logged out successfully' };
  }
}
