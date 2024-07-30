// src/services/supabase.service.ts
import { Injectable } from '@nestjs/common';
import { supabase } from '../config/supabase.config';

@Injectable()
export class SupabaseService {
  getClient() {
    if (process.env.NODE_ENV === 'test') {
      return null;
    }
    return supabase;
  }
}
