// src/config/supabase.config.spec.ts
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => 'mocked-client'),
}));

describe('Supabase Configuration', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('should not create supabase client in test environment', () => {
    process.env.NODE_ENV = 'test';
    const { getSupabaseClient, supabase } = require('./supabase.config');
    expect(getSupabaseClient()).toBeNull();
    expect(supabase).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
  });

  it('should throw an error if SUPABASE_URL or SUPABASE_KEY is missing', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_KEY;

    expect(() => require('./supabase.config')).toThrow(
      'SUPABASE_URL and SUPABASE_KEY must be set'
    );
    expect(createClient).not.toHaveBeenCalled();
  });

  it('should create supabase client if environment variables are set', () => {
    process.env.NODE_ENV = 'development';
    process.env.SUPABASE_URL = 'https://xyzcompany.supabase.co';
    process.env.SUPABASE_KEY = 'public-anon-key';

    const { getSupabaseClient, _createClient } = require('./supabase.config');
    const supabase = getSupabaseClient();

    expect(_createClient).toHaveBeenCalledWith(
      'https://xyzcompany.supabase.co',
      'public-anon-key'
    );
    expect(supabase).toBe('mocked-client');
  });

  it('should create supabase client only once when using exported supabase instance', () => {
    process.env.NODE_ENV = 'development';
    process.env.SUPABASE_URL = 'https://xyzcompany.supabase.co';
    process.env.SUPABASE_KEY = 'public-anon-key';

    const { supabase: supabase1, _createClient } = require('./supabase.config');
    const { supabase: supabase2 } = require('./supabase.config');

    expect(_createClient).toHaveBeenCalledTimes(1);
    expect(supabase1).toBe('mocked-client');
    expect(supabase1).toBe(supabase2);
  });
});
