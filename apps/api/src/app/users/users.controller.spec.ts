import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService) as jest.Mocked<UsersService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };
      const createdUser: User = {
        id: 'some-id',
        ...createUserDto,
        workoutPlans: [],
        workoutSessions: [],
        progressRecords: [],
      };

      service.create.mockResolvedValue(createdUser);

      expect(await controller.create(createUserDto)).toBe(createdUser);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users: User[] = [
        {
          id: '1',
          name: 'User 1',
          email: 'user1@example.com',
          password: 'pass1',
          workoutPlans: [],
          workoutSessions: [],
          progressRecords: [],
        },
        {
          id: '2',
          name: 'User 2',
          email: 'user2@example.com',
          password: 'pass2',
          workoutPlans: [],
          workoutSessions: [],
          progressRecords: [],
        },
      ];

      service.findAll.mockResolvedValue(users);

      expect(await controller.findAll()).toBe(users);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const user: User = {
        id: '1',
        name: 'User 1',
        email: 'user1@example.com',
        password: 'pass1',
        workoutPlans: [],
        workoutSessions: [],
        progressRecords: [],
      };

      service.findOne.mockResolvedValue(user);

      expect(await controller.findOne('1')).toBe(user);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = { name: 'Updated User' };
      const updatedUser: User = {
        id: '1',
        name: 'Updated User',
        email: 'user1@example.com',
        password: 'pass1',
        workoutPlans: [],
        workoutSessions: [],
        progressRecords: [],
      };

      service.update.mockResolvedValue(updatedUser);

      expect(await controller.update('1', updateUserDto)).toBe(updatedUser);
      expect(service.update).toHaveBeenCalledWith('1', updateUserDto);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      service.remove.mockResolvedValue(undefined);

      await expect(controller.remove('1')).resolves.toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
});
