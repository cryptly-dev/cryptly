import { Logger } from '@logdash/js-sdk';
import { Controller, Get, INestApplication, UnauthorizedException } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AllExceptionsFilter } from '../../src/shared/filters/all-exceptions.filter';
import { OurEnv } from '../../src/shared/types/our-env.enum';
import { LoggerMock } from '../utils/mocks/logger-mock';

@Controller()
class FailingController {
  @Get('expired-session')
  public expiredSession(): void {
    throw new UnauthorizedException();
  }

  @Get('crash')
  public crash(): void {
    throw new Error('boom');
  }
}

describe('Exception logging', () => {
  const originalEnv = process.env.OUR_ENV;
  let app: INestApplication;
  let logger: LoggerMock;

  beforeAll(async () => {
    process.env.OUR_ENV = OurEnv.Prod;
    const module = await Test.createTestingModule({
      controllers: [FailingController],
    }).compile();

    logger = new LoggerMock();
    app = module.createNestApplication();
    app.useGlobalFilters(
      new AllExceptionsFilter(logger as unknown as Logger, app.get(HttpAdapterHost).httpAdapter),
    );
    await app.init();
  });

  beforeEach(() => {
    logger.entries.length = 0;
  });

  afterAll(async () => {
    process.env.OUR_ENV = originalEnv;
    await app.close();
  });

  it('keeps a rejected request out of the error logs', async () => {
    // when
    const response = await request(app.getHttpServer()).get('/expired-session');

    // then
    expect(response.status).toEqual(401);
    expect(logger.entries.map((entry) => entry.level)).toEqual(['http']);
  });

  it('reports a crash as an error with its stack', async () => {
    // when
    const response = await request(app.getHttpServer()).get('/crash');

    // then
    expect(response.status).toEqual(500);
    expect(logger.entries).toEqual([
      {
        level: 'error',
        data: [
          'Unhandled Exception',
          expect.objectContaining({
            statusCode: 500,
            path: '/crash',
            stack: expect.stringContaining('boom'),
          }),
        ],
      },
    ]);
  });
});
