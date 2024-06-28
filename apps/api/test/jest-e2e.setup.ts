import { Logger } from '@nestjs/common';

beforeAll(() => {
  Logger.overrideLogger(['error', 'warn', 'log', 'debug', 'verbose']);
});

jest.setTimeout(30000); // Increase timeout to 30 seconds
