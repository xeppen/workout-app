import {
  Delete,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  Param,
  Req,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SupabaseService } from '../auth/supabase.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private supabaseService: SupabaseService
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists by Supabase ID
    const existingUser = await this.usersRepository.findOne({
      where: { id: createUserDto.id },
    });

    if (existingUser) {
      // If user exists, update their information
      Object.assign(existingUser, createUserDto);
      return await this.usersRepository.save(existingUser);
    }

    // If user doesn't exist, create a new one
    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return await this.usersRepository.save(user);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    // Ensure that a user can only delete their own profile
    if (id !== req.user.id) {
      throw new HttpException(
        'You can only delete your own profile',
        HttpStatus.FORBIDDEN
      );
    }

    // Delete from your local database
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    // Delete from Supabase Authentication
    try {
      await this.supabaseService.deleteUserFromAuth(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return { message: 'User deleted successfully' };
  }

  async findOrCreate(supabaseUser: any): Promise<User> {
    let user = await this.usersRepository.findOne({
      where: { id: supabaseUser.id },
    });
    if (!user) {
      user = this.usersRepository.create({
        id: supabaseUser.id,
        email: supabaseUser.email,
        // Add any other fields you want to store
      });
      await this.usersRepository.save(user);
    }
    return user;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.usersRepository.update(userId, { lastLoginAt: new Date() });
  }
}
