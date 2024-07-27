// src/services/supabase.service.ts
import { Injectable } from '@nestjs/common';
import { supabase } from '../config/supabase.config';

@Injectable()
export class SupabaseService {
  getClient() {
    return supabase;
  }
}
