import { Logger } from '@logdash/js-sdk';
import * as request from 'supertest';
import { RefreshTokenWriteService } from '../../src/auth/refresh-token/write/refresh-token-write.service';
import { createTestApp } from '../utils/bootstrap';
import { LoggerMock } from '../utils/mocks/logger-mock';

describe('RefreshTokenCoreController (writes)', () => {
  let bootstrap: Awaited<ReturnType<typeof createTestApp>>;
  let logger: LoggerMock;

  const refresh = (refreshToken: string) =>
    request(bootstrap.app.getHttpServer()).post('/auth/refresh').send({ refreshToken });

  beforeAll(async () => {
    bootstrap = await createTestApp();
    logger = bootstrap.module.get(Logger) as unknown as LoggerMock;
  });

  beforeEach(async () => {
    await bootstrap.methods.beforeEach();
    logger.entries.length = 0;
  });

  afterAll(async () => {
    await bootstrap.methods.afterAll();
  });

  describe('POST /auth/refresh', () => {
    it('warns without the token and ends the session when a rotated token is reused', async () => {
      // given
      const { user } = await bootstrap.utils.userUtils.createDefault();
      const { rawToken } = await bootstrap.module.get(RefreshTokenWriteService).issue(user.id);
      const rotated = await refresh(rawToken);

      // when
      const reuse = await refresh(rawToken);

      // then
      expect(rotated.status).toEqual(201);
      expect(reuse.status).toEqual(401);
      expect(logger.entries).toEqual([
        { level: 'warn', data: ['Refresh token reuse detected', { userId: user.id }] },
      ]);
      expect(JSON.stringify(logger.entries)).not.toContain(rawToken);

      const afterReuse = await refresh(rotated.body.refreshToken);
      expect(afterReuse.status).toEqual(401);
    });
  });
});
