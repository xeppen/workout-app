// mock-supabase.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class MockSupabaseService {
  async signUp(email: string, password: string) {
    return {
      data: { user: { id: 'mock-user-id', email }, session: {} },
      error: null,
    };
  }

  async signIn(email: string, password: string) {
    return {
      data: {
        user: { id: 'mock-user-id', email },
        session: { access_token: 'mock-token' },
      },
      error: null,
    };
  }

  // Add other methods as needed
}
