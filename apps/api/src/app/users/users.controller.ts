import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(SupabaseAuthGuard)
  create(@Body() createUserDto: CreateUserDto, @Req() req) {
    createUserDto.id = req.user.id;
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(SupabaseAuthGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('profile')
  @UseGuards(SupabaseAuthGuard)
  getProfile(@Req() req) {
    return req.user;
  }

  @Get(':id')
  @UseGuards(SupabaseAuthGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req
  ) {
    // Ensure the user can only update their own profile
    if (id !== req.user.id) {
      throw new Error('You can only update your own profile');
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  remove(@Param('id') id: string, @Req() req) {
    // Ensure the user can only delete their own profile
    if (id !== req.user.id) {
      throw new Error('You can only delete your own profile');
    }
    return this.usersService.remove(id);
  }
}
