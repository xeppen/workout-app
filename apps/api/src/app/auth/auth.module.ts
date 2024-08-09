import { Module } from '@nestjs/common';
import { SupabaseModule } from './supabase.module';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    SupabaseModule,
  ],
  providers: [JwtStrategy, SupabaseAuthGuard],
  exports: [PassportModule, SupabaseAuthGuard],
})
export class AuthModule {}
