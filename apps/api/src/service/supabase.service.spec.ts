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

  it('should return the supabase client', () => {
    const client = service.getClient();
    expect(client).toBe(supabase);
  });
});
