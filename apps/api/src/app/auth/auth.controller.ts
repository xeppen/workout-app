import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    try {
      const { data, error } = await this.supabaseService.signInWithEmail(
        loginDto.email,
        loginDto.password
      );

      if (error) {
        throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
      }

      return {
        accessToken: data.session.access_token,
        user: data.user,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new HttpException(
        error.message || 'An error occurred during login',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
