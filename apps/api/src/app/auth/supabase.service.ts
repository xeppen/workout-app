import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  createClient,
  SupabaseClient,
  AuthResponse,
} from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase: SupabaseClient;

  constructor() {}

  onModuleInit() {
    this.initSupabase();
  }

  private initSupabase() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
      console.error(
        'SUPABASE_URL or SUPABASE_KEY is not set in the environment'
      );
      throw new Error('Supabase configuration is missing');
    }

    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    console.log('Supabase client initialized');
  }

  getClient(): SupabaseClient {
    if (!this.supabase) {
      throw new Error('Supabase client is not initialized');
    }
    return this.supabase;
  }

  async signInWithEmail(
    email: string,
    password: string
  ): Promise<AuthResponse> {
    console.log(`Attempting to sign in user: ${email}`);
    const response = await this.getClient().auth.signInWithPassword({
      email,
      password,
    });
    console.log('Sign in response:', response);
    return response;
  }

  async signUp(email: string, password: string): Promise<AuthResponse> {
    console.log(`Attempting to sign up user: ${email}`);
    const response = await this.getClient().auth.signUp({
      email,
      password,
    });
    console.log('Sign up response:', response);
    return response;
  }

  async signInWithMagicLink(email: string): Promise<AuthResponse> {
    console.log(`Sending magic link to: ${email}`);
    return await this.getClient().auth.signInWithOtp({ email });
  }

  async getUserById(id: string) {
    const { data, error } = await this.supabase.auth.admin.getUserById(id);
    if (error) throw error;
    return data.user;
  }

  async signOut(userId: string): Promise<{ error: Error | null }> {
    return await this.getClient().auth.admin.signOut(userId);
  }
}
