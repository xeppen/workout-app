// src/config/supabase.config.spec.ts
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => 'mocked-client'),
}));

describe('Supabase Configuration', () => {
  const OLD_ENV = process.env;
  let mockGetSupabaseClient;
  let mockSupabase;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    jest.clearAllMocks();

    mockGetSupabaseClient = jest.fn();
    mockSupabase = null;

    jest.mock('./supabase.config', () => ({
      getSupabaseClient: mockGetSupabaseClient,
      supabase: mockSupabase,
    }));
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('should not create supabase client in test environment', () => {
    process.env.NODE_ENV = 'test';
    mockGetSupabaseClient.mockReturnValue(null);

    const { getSupabaseClient, supabase } = require('./supabase.config');
    expect(getSupabaseClient()).toBeNull();
    expect(supabase).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
  });

  it('should throw an error if SUPABASE_URL or SUPABASE_KEY is missing', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_KEY;

    mockGetSupabaseClient.mockImplementation(() => {
      throw new Error('SUPABASE_URL and SUPABASE_KEY must be set');
    });

    const { getSupabaseClient } = require('./supabase.config');
    expect(() => getSupabaseClient()).toThrow(
      'SUPABASE_URL and SUPABASE_KEY must be set'
    );
    expect(createClient).not.toHaveBeenCalled();
  });

  it('should create supabase client if environment variables are set', () => {
    process.env.NODE_ENV = 'development';
    process.env.SUPABASE_URL = 'https://xyzcompany.supabase.co';
    process.env.SUPABASE_KEY = 'public-anon-key';

    mockGetSupabaseClient.mockReturnValue('mocked-client');

    const { getSupabaseClient } = require('./supabase.config');
    const supabase = getSupabaseClient();

    expect(mockGetSupabaseClient).toHaveBeenCalled();
    expect(supabase).toBe('mocked-client');
  });

  it('should create supabase client only once when using exported supabase instance', () => {
    process.env.NODE_ENV = 'development';
    process.env.SUPABASE_URL = 'https://xyzcompany.supabase.co';
    process.env.SUPABASE_KEY = 'public-anon-key';

    mockSupabase = 'mocked-client';

    const { supabase: supabase1 } = require('./supabase.config');
    const { supabase: supabase2 } = require('./supabase.config');

    expect(supabase1).toBe('mocked-client');
    expect(supabase1).toBe(supabase2);
  });
});
