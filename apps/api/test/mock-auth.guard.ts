// mock-auth.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    request.user = {
      id: 'mock-user-id',
      email: 'mock@example.com',
      // Add any other properties your app expects in the user object
    };
    return true;
  }
}
