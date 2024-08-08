import { Module } from '@nestjs/common';
import { SupabaseModule } from './supabase.module';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { AuthController } from './auth.controller';

@Module({
  imports: [SupabaseModule],
  providers: [SupabaseAuthGuard],
  controllers: [AuthController],
  exports: [SupabaseAuthGuard],
})
export class AuthModule {}
