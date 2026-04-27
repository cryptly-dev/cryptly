import { advanceBy } from 'jest-date-mock';
import * as request from 'supertest';
import { CliSessionStatus } from '../../src/auth/cli-flow/core/entities/cli-session-status.enum';
import { createTestApp } from '../utils/bootstrap';

describe('CliFlowController', () => {
  let bootstrap: Awaited<ReturnType<typeof createTestApp>>;

  beforeAll(async () => {
    bootstrap = await createTestApp();
  });

  beforeEach(async () => {
    await bootstrap.methods.beforeEach();
  });

  afterAll(async () => {
    await bootstrap.methods.afterAll();
  });

  describe('POST /auth/cli-flow/sessions', () => {
    it('creates a pending session and returns an approve URL', async () => {
      // when
      const response = await request(bootstrap.app.getHttpServer())
        .post('/auth/cli-flow/sessions')
        .send({ tempPublicKey: 'pk-base64', deviceName: 'macbook' });

      // then
      expect(response.status).toBe(201);
      expect(response.body.sessionId).toEqual(expect.any(String));
      expect(response.body.approveUrl).toMatch(/\/app\/cli-authorize\?session=/);
      expect(response.body.expiresAt).toEqual(expect.any(Number));
      expect(response.body.expiresAt).toBeGreaterThan(Date.now());
    });

    it('does not require authentication', async () => {
      // when
      const response = await request(bootstrap.app.getHttpServer())
        .post('/auth/cli-flow/sessions')
        .send({ tempPublicKey: 'pk', deviceName: 'd' });

      // then
      expect(response.status).toBe(201);
    });

    it('rejects missing fields', async () => {
      // when
      const response = await request(bootstrap.app.getHttpServer())
        .post('/auth/cli-flow/sessions')
        .send({});

      // then
      expect(response.status).toBe(400);
    });
  });

  describe('GET /auth/cli-flow/sessions/:id', () => {
    it('returns session info for an authenticated caller', async () => {
      // given
      const { token } = await bootstrap.utils.userUtils.createDefault({ email: 'a@b.com' });
      const session = await startSession();

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .get(`/auth/cli-flow/sessions/${session.sessionId}`)
        .set('authorization', `Bearer ${token}`);

      // then
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        sessionId: session.sessionId,
        deviceName: 'macbook',
        status: CliSessionStatus.Pending,
        expiresAt: expect.any(Number),
        tempPublicKey: 'pk-base64',
      });
    });

    it('returns 401 when not authenticated', async () => {
      // when
      const response = await request(bootstrap.app.getHttpServer()).get(
        '/auth/cli-flow/sessions/anything',
      );

      // then
      expect(response.status).toBe(401);
    });

    it('returns 404 for an unknown session', async () => {
      // given
      const { token } = await bootstrap.utils.userUtils.createDefault({ email: 'a@b.com' });

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .get('/auth/cli-flow/sessions/not-a-real-id')
        .set('authorization', `Bearer ${token}`);

      // then
      expect(response.status).toBe(404);
    });

    it('returns 404 for an expired session', async () => {
      // given
      const { token } = await bootstrap.utils.userUtils.createDefault({ email: 'a@b.com' });
      const session = await startSession();
      advanceBy(11 * 60 * 1000);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .get(`/auth/cli-flow/sessions/${session.sessionId}`)
        .set('authorization', `Bearer ${token}`);

      // then
      expect(response.status).toBe(404);
    });
  });

  describe('POST /auth/cli-flow/sessions/:id/approve', () => {
    it('marks the session approved', async () => {
      // given
      const { token } = await bootstrap.utils.userUtils.createDefault({ email: 'a@b.com' });
      const session = await startSession();

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .post(`/auth/cli-flow/sessions/${session.sessionId}/approve`)
        .send({ wrappedKey: 'wk', encryptedPrivateKey: 'epk' })
        .set('authorization', `Bearer ${token}`);

      // then
      expect(response.status).toBe(201);
    });

    it('returns 401 when not authenticated', async () => {
      // given
      const session = await startSession();

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .post(`/auth/cli-flow/sessions/${session.sessionId}/approve`)
        .send({ wrappedKey: 'wk', encryptedPrivateKey: 'epk' });

      // then
      expect(response.status).toBe(401);
    });

    it('returns 409 when approving an already-approved session', async () => {
      // given
      const { token } = await bootstrap.utils.userUtils.createDefault({ email: 'a@b.com' });
      const session = await startSession();

      await request(bootstrap.app.getHttpServer())
        .post(`/auth/cli-flow/sessions/${session.sessionId}/approve`)
        .send({ wrappedKey: 'wk', encryptedPrivateKey: 'epk' })
        .set('authorization', `Bearer ${token}`);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .post(`/auth/cli-flow/sessions/${session.sessionId}/approve`)
        .send({ wrappedKey: 'wk2', encryptedPrivateKey: 'epk2' })
        .set('authorization', `Bearer ${token}`);

      // then
      expect(response.status).toBe(409);
    });
  });

  describe('GET /auth/cli-flow/sessions/:id/poll', () => {
    it('returns pending while the session has not been approved', async () => {
      // given
      const session = await startSession();

      // when
      const response = await request(bootstrap.app.getHttpServer()).get(
        `/auth/cli-flow/sessions/${session.sessionId}/poll`,
      );

      // then
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: CliSessionStatus.Pending });
    });

    it('returns the approval payload + tokens once approved, then becomes consumed', async () => {
      // given
      const { token, user } = await bootstrap.utils.userUtils.createDefault({ email: 'a@b.com' });
      const session = await startSession();
      await request(bootstrap.app.getHttpServer())
        .post(`/auth/cli-flow/sessions/${session.sessionId}/approve`)
        .send({ wrappedKey: 'wk', encryptedPrivateKey: 'epk' })
        .set('authorization', `Bearer ${token}`);

      // when
      const first = await request(bootstrap.app.getHttpServer()).get(
        `/auth/cli-flow/sessions/${session.sessionId}/poll`,
      );

      // then — first poll returns the payload
      expect(first.status).toBe(200);
      expect(first.body).toEqual({
        status: CliSessionStatus.Approved,
        jwt: expect.any(String),
        refreshToken: expect.any(String),
        wrappedKey: 'wk',
        encryptedPrivateKey: 'epk',
        userId: user.id,
      });

      // when — second poll
      const second = await request(bootstrap.app.getHttpServer()).get(
        `/auth/cli-flow/sessions/${session.sessionId}/poll`,
      );

      // then — payload is gone
      expect(second.status).toBe(200);
      expect(second.body).toEqual({ status: CliSessionStatus.Consumed });
    });

    it('the issued JWT works against an authenticated endpoint', async () => {
      // given
      const { token } = await bootstrap.utils.userUtils.createDefault({ email: 'a@b.com' });
      const session = await startSession();
      await request(bootstrap.app.getHttpServer())
        .post(`/auth/cli-flow/sessions/${session.sessionId}/approve`)
        .send({ wrappedKey: 'wk', encryptedPrivateKey: 'epk' })
        .set('authorization', `Bearer ${token}`);

      const poll = await request(bootstrap.app.getHttpServer()).get(
        `/auth/cli-flow/sessions/${session.sessionId}/poll`,
      );

      // when — call /users/me with the JWT minted by the cli flow
      const me = await request(bootstrap.app.getHttpServer())
        .get('/users/me')
        .set('authorization', `Bearer ${poll.body.jwt}`);

      // then
      expect(me.status).toBe(200);
      expect(me.body.email).toBe('a@b.com');
    });
  });

  async function startSession(): Promise<{ sessionId: string }> {
    const response = await request(bootstrap.app.getHttpServer())
      .post('/auth/cli-flow/sessions')
      .send({ tempPublicKey: 'pk-base64', deviceName: 'macbook' });
    return { sessionId: response.body.sessionId };
  }
});
