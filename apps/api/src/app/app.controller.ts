import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return { message: 'Hello API' };
  }

  @Get('api')
  getDataWithPrefix() {
    return { message: 'Hello API' };
  }
}
