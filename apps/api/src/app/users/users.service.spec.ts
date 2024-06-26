import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(
      getRepositoryToken(User)
    ) as jest.Mocked<Repository<User>>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully insert a user', async () => {
      const user: CreateUserDto = {
        email: 'test@example.com',
        password: 'testpass',
        name: 'Test User',
      };
      const savedUser = { id: 'some-id', ...user };

      repo.findOne.mockResolvedValue(null);
      repo.create.mockReturnValue(savedUser as User);
      repo.save.mockResolvedValue(savedUser as User);

      expect(await service.create(user)).toEqual(savedUser);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { email: user.email },
      });
      expect(repo.create).toHaveBeenCalledWith(user);
      expect(repo.save).toHaveBeenCalledWith(savedUser);
    });

    it('should throw ConflictException if user with email already exists', async () => {
      const user: CreateUserDto = {
        email: 'existing@example.com',
        password: 'testpass',
        name: 'Existing User',
      };

      repo.findOne.mockResolvedValue({ id: 'existing-id', ...user } as User);

      await expect(service.create(user)).rejects.toThrow(ConflictException);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { email: user.email },
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [
        { id: '1', name: 'User 1', email: 'user1@example.com' },
        { id: '2', name: 'User 2', email: 'user2@example.com' },
      ];
      repo.find.mockResolvedValue(users as User[]);

      expect(await service.findAll()).toEqual(users);
      expect(repo.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      const user = { id: '1', name: 'User 1', email: 'user1@example.com' };
      repo.findOne.mockResolvedValue(user as User);

      expect(await service.findOne('1')).toEqual(user);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException if user is not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException
      );
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 'non-existent' },
      });
    });
  });

  describe('update', () => {
    it('should update and return the user if found', async () => {
      const user = { id: '1', name: 'User 1', email: 'user1@example.com' };
      const updateDto: UpdateUserDto = { name: 'Updated User 1' };
      const updatedUser = { ...user, ...updateDto };

      repo.findOne.mockResolvedValue(user as User);
      repo.save.mockResolvedValue(updatedUser as User);

      expect(await service.update('1', updateDto)).toEqual(updatedUser);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(repo.save).toHaveBeenCalledWith(updatedUser);
    });

    it('should throw NotFoundException if user is not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { name: 'Updated' })
      ).rejects.toThrow(NotFoundException);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 'non-existent' },
      });
    });
  });

  describe('remove', () => {
    it('should remove the user if found', async () => {
      repo.delete.mockResolvedValue({ affected: 1, raw: null });

      await expect(service.remove('1')).resolves.not.toThrow();
      expect(repo.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if user is not found', async () => {
      repo.delete.mockResolvedValue({ affected: 0, raw: null });

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException
      );
      expect(repo.delete).toHaveBeenCalledWith('non-existent');
    });
  });
});
