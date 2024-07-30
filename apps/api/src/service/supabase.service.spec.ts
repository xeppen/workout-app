import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseService } from './subabase.service';
import { supabase } from '../config/supabase.config';

jest.mock('../config/supabase.config', () => ({
  supabase: {
    from: jest.fn(),
    select: jest.fn(),
    // Mock other methods as needed
  },
}));

describe('SupabaseService', () => {
  let service: SupabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SupabaseService],
    }).compile();

    service = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getClient', () => {
    it('should return the supabase client when NODE_ENV is not test', () => {
      process.env.NODE_ENV = 'development';
      const client = service.getClient();
      expect(client).toBe(supabase);
    });

    it('should return null when NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test';
      const client = service.getClient();
      expect(client).toBeNull();
    });
  });
});
