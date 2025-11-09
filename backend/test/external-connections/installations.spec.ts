process.env.GH_WEBHOOKS_SECRET = 'test-webhook-secret';

import { createHmac } from 'crypto';
import * as request from 'supertest';
import { GithubExternalConnectionClientService } from '../../src/external-connection/github/client/github-external-connection-client.service';
import { createTestApp } from '../utils/bootstrap';

function computeWebhookSignature(payload: string, secret: string): string {
  const hmac = createHmac('sha256', secret);
  hmac.update(payload);
  return `sha256=${hmac.digest('hex')}`;
}

describe('GithubExternalConnectionCoreController (installations)', () => {
  let bootstrap: Awaited<ReturnType<typeof createTestApp>>;
  let clientMock: jest.Mocked<GithubExternalConnectionClientService>;

  beforeAll(async () => {
    bootstrap = await createTestApp();
  });

  beforeEach(async () => {
    await bootstrap.methods.beforeEach();
    clientMock = bootstrap.app.get(GithubExternalConnectionClientService);
  });

  afterAll(async () => {
    await bootstrap.methods.afterAll();
  });

  describe('POST /users/me/external-connections/github/installations', () => {
    it('creates a new GitHub installation', async () => {
      const setup = await bootstrap.utils.userUtils.createDefault();
      const githubInstallationId = 123456;

      const response = await request(bootstrap.app.getHttpServer())
        .post('/users/me/external-connections/github/installations')
        .set('authorization', `Bearer ${setup.token}`)
        .send({ githubInstallationId });

      expect(response.status).toEqual(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        userId: setup.user.id,
        githubInstallationId,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('returns 409 if installation already exists', async () => {
      const setup = await bootstrap.utils.userUtils.createDefault();
      const githubInstallationId = 123456;

      await bootstrap.utils.githubExternalConnectionUtils.createInstallation(
        setup.token,
        githubInstallationId,
      );

      const response = await request(bootstrap.app.getHttpServer())
        .post('/users/me/external-connections/github/installations')
        .set('authorization', `Bearer ${setup.token}`)
        .send({ githubInstallationId });

      expect(response.status).toEqual(409);
    });

    it('returns 401 when not authenticated', async () => {
      const response = await request(bootstrap.app.getHttpServer())
        .post('/users/me/external-connections/github/installations')
        .send({ githubInstallationId: 123456 });

      expect(response.status).toEqual(401);
    });
  });

  describe('GET /users/me/external-connections/github/installations', () => {
    it('returns current user installations', async () => {
      const setup = await bootstrap.utils.userUtils.createDefault();

      clientMock.getInstallationByGithubInstallationId.mockResolvedValue({
        id: 123456,
        owner: 'test-owner',
        avatar: 'https://github.com/test-avatar.png',
      });

      const installation = await bootstrap.utils.githubExternalConnectionUtils.createInstallation(
        setup.token,
        123456,
      );

      const response = await request(bootstrap.app.getHttpServer())
        .get('/users/me/external-connections/github/installations')
        .set('authorization', `Bearer ${setup.token}`);

      expect(response.status).toEqual(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toEqual({
        id: installation.id,
        userId: setup.user.id,
        githubInstallationId: 123456,
        liveData: {
          id: 123456,
          owner: 'test-owner',
          avatar: 'https://github.com/test-avatar.png',
        },
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('returns empty array if no installations', async () => {
      const setup = await bootstrap.utils.userUtils.createDefault();

      const response = await request(bootstrap.app.getHttpServer())
        .get('/users/me/external-connections/github/installations')
        .set('authorization', `Bearer ${setup.token}`);

      expect(response.status).toEqual(200);
      expect(response.body).toEqual([]);
    });

    it('returns 401 when not authenticated', async () => {
      const response = await request(bootstrap.app.getHttpServer()).get(
        '/users/me/external-connections/github/installations',
      );

      expect(response.status).toEqual(401);
    });
  });

  describe('GET /external-connections/github/installations/:installationEntityId', () => {
    it('returns installation by id', async () => {
      const setup = await bootstrap.utils.userUtils.createDefault();

      clientMock.getInstallationByGithubInstallationId.mockResolvedValue({
        id: 123456,
        owner: 'test-owner',
        avatar: 'https://github.com/test-avatar.png',
      });

      const installation = await bootstrap.utils.githubExternalConnectionUtils.createInstallation(
        setup.token,
        123456,
      );

      const response = await request(bootstrap.app.getHttpServer())
        .get(`/external-connections/github/installations/${installation.id}`)
        .set('authorization', `Bearer ${setup.token}`);

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        id: installation.id,
        userId: setup.user.id,
        githubInstallationId: 123456,
        liveData: {
          id: 123456,
          owner: 'test-owner',
          avatar: 'https://github.com/test-avatar.png',
        },
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('returns 404 if installation not found', async () => {
      const setup = await bootstrap.utils.userUtils.createDefault();

      const response = await request(bootstrap.app.getHttpServer())
        .get('/external-connections/github/installations/60f7eabc1234567890abcdef')
        .set('authorization', `Bearer ${setup.token}`);

      expect(response.status).toEqual(404);
    });

    it('returns 401 when not authenticated', async () => {
      const response = await request(bootstrap.app.getHttpServer()).get(
        '/external-connections/github/installations/60f7eabc1234567890abcdef',
      );

      expect(response.status).toEqual(401);
    });

    it('returns 403 when installation does not belong to user', async () => {
      const setupA = await bootstrap.utils.userUtils.createDefault();
      const setupB = await bootstrap.utils.userUtils.createDefault();
      const installation = await bootstrap.utils.githubExternalConnectionUtils.createInstallation(
        setupA.token,
        123456,
      );

      const response = await request(bootstrap.app.getHttpServer())
        .get(`/external-connections/github/installations/${installation.id}`)
        .set('authorization', `Bearer ${setupB.token}`);

      expect(response.status).toEqual(403);
    });
  });

  describe('GET /external-connections/github/installations/:installationEntityId/repositories', () => {
    it('returns repositories available for installation', async () => {
      const setup = await bootstrap.utils.userUtils.createDefault();

      const repositories = [
        {
          id: 1,
          owner: 'test-owner',
          avatarUrl: 'https://github.com/avatar1.png',
          name: 'repo1',
          url: 'https://github.com/test-owner/repo1',
          isPrivate: false,
        },
        {
          id: 2,
          owner: 'test-owner',
          avatarUrl: 'https://github.com/avatar2.png',
          name: 'repo2',
          url: 'https://github.com/test-owner/repo2',
          isPrivate: true,
        },
      ];

      clientMock.getRepositoriesAvailableForInstallation.mockResolvedValue(repositories);

      const installation = await bootstrap.utils.githubExternalConnectionUtils.createInstallation(
        setup.token,
        123456,
      );

      const response = await request(bootstrap.app.getHttpServer())
        .get(`/external-connections/github/installations/${installation.id}/repositories`)
        .set('authorization', `Bearer ${setup.token}`);

      expect(response.status).toEqual(200);
      expect(response.body).toEqual(repositories);
    });

    it('returns 404 if installation not found', async () => {
      const setup = await bootstrap.utils.userUtils.createDefault();

      const response = await request(bootstrap.app.getHttpServer())
        .get('/external-connections/github/installations/60f7eabc1234567890abcdef/repositories')
        .set('authorization', `Bearer ${setup.token}`);

      expect(response.status).toEqual(404);
    });

    it('returns 401 when not authenticated', async () => {
      const response = await request(bootstrap.app.getHttpServer()).get(
        '/external-connections/github/installations/60f7eabc1234567890abcdef/repositories',
      );

      expect(response.status).toEqual(401);
    });

    it('returns 403 when installation does not belong to user', async () => {
      const setupA = await bootstrap.utils.userUtils.createDefault();
      const setupB = await bootstrap.utils.userUtils.createDefault();
      const installation = await bootstrap.utils.githubExternalConnectionUtils.createInstallation(
        setupA.token,
        123456,
      );

      const response = await request(bootstrap.app.getHttpServer())
        .get(`/external-connections/github/installations/${installation.id}/repositories`)
        .set('authorization', `Bearer ${setupB.token}`);

      expect(response.status).toEqual(403);
    });
  });

  describe('POST /webhooks/github', () => {
    const webhookSecret = 'test-webhook-secret';

    it('deletes installation and its integrations', async () => {
      // given
      const setup = await bootstrap.utils.userUtils.createDefault();
      const project = await bootstrap.utils.projectUtils.createProject(setup.token);
      const installation = await bootstrap.utils.githubExternalConnectionUtils.createInstallation(
        setup.token,
        123456,
      );

      clientMock.getRepositoryInfoByInstallationIdAndRepositoryId.mockResolvedValue({
        id: 789,
        owner: 'test-owner',
        name: 'test-repo',
        avatarUrl: 'https://github.com/avatar.png',
        url: 'https://github.com/test-owner/test-repo',
        isPrivate: false,
      });

      clientMock.getRepositoryPublicKey.mockResolvedValue({
        key: 'test-public-key',
        keyId: 'test-key-id',
      });

      await bootstrap.utils.githubExternalConnectionUtils.createIntegration(setup.token, {
        repositoryId: 789,
        installationEntityId: installation.id,
        projectId: project.id,
      });

      const payload = JSON.stringify({ action: 'deleted', installation: { id: 123456 } });

      // when
      const signature = computeWebhookSignature(payload, webhookSecret);
      const response = await request(bootstrap.app.getHttpServer())
        .post('/webhooks/github')
        .set('x-hub-signature-256', signature)
        .set('content-type', 'application/json')
        .send(payload);

      // then
      expect(response.status).toEqual(201);

      const installationsResponse = await request(bootstrap.app.getHttpServer())
        .get('/users/me/external-connections/github/installations')
        .set('authorization', `Bearer ${setup.token}`);

      expect(installationsResponse.status).toEqual(200);
      expect(installationsResponse.body).toEqual([]);

      const integrationsResponse = await request(bootstrap.app.getHttpServer())
        .get(`/projects/${project.id}/external-connections/github/integrations`)
        .set('authorization', `Bearer ${setup.token}`);

      expect(integrationsResponse.status).toEqual(200);
      expect(integrationsResponse.body).toEqual([]);
    });

    it('returns 201 when installation does not exist', async () => {
      const payload = JSON.stringify({ action: 'deleted', installation: { id: 999999 } });

      const signature = computeWebhookSignature(payload, webhookSecret);

      const response = await request(bootstrap.app.getHttpServer())
        .post('/webhooks/github')
        .set('x-hub-signature-256', signature)
        .set('content-type', 'application/json')
        .send(payload);

      expect(response.status).toEqual(201);
    });

    it('ignores non-deleted installation events', async () => {
      // given
      const setup = await bootstrap.utils.userUtils.createDefault();
      const installation = await bootstrap.utils.githubExternalConnectionUtils.createInstallation(
        setup.token,
        123456,
      );
      const payload = JSON.stringify({ action: 'created', installation: { id: 123456 } });

      clientMock.getInstallationByGithubInstallationId.mockResolvedValue({
        id: 123456,
        owner: 'test-owner',
        avatar: 'https://github.com/test-avatar.png',
      });

      // when
      const signature = computeWebhookSignature(payload, webhookSecret);
      const response = await request(bootstrap.app.getHttpServer())
        .post('/webhooks/github')
        .set('x-hub-signature-256', signature)
        .set('content-type', 'application/json')
        .send(payload);

      // then
      expect(response.status).toEqual(201);

      const installationsResponse = await request(bootstrap.app.getHttpServer())
        .get('/users/me/external-connections/github/installations')
        .set('authorization', `Bearer ${setup.token}`);

      expect(installationsResponse.status).toEqual(200);
      expect(installationsResponse.body).toHaveLength(1);
    });

    it('ignores other webhook events without installation field', async () => {
      const payload = JSON.stringify({ action: 'opened' });

      const signature = computeWebhookSignature(payload, webhookSecret);

      const response = await request(bootstrap.app.getHttpServer())
        .post('/webhooks/github')
        .set('x-hub-signature-256', signature)
        .set('content-type', 'application/json')
        .send(payload);

      expect(response.status).toEqual(201);
    });

    it('returns 400 when action is missing', async () => {
      const payload = JSON.stringify({ installation: { id: 123456 } });

      const signature = computeWebhookSignature(payload, webhookSecret);

      const response = await request(bootstrap.app.getHttpServer())
        .post('/webhooks/github')
        .set('x-hub-signature-256', signature)
        .set('content-type', 'application/json')
        .send(payload);

      expect(response.status).toEqual(400);
    });

    it('returns 401 when signature is missing', async () => {
      const response = await request(bootstrap.app.getHttpServer())
        .post('/webhooks/github')
        .set('content-type', 'application/json')
        .send({ action: 'deleted', installation: { id: 123456 } });

      expect(response.status).toEqual(401);
    });

    it('returns 401 when signature is invalid', async () => {
      const payload = JSON.stringify({ action: 'deleted', installation: { id: 123456 } });

      const response = await request(bootstrap.app.getHttpServer())
        .post('/webhooks/github')
        .set('x-hub-signature-256', 'sha256=invalid-signature')
        .set('content-type', 'application/json')
        .send(payload);

      expect(response.status).toEqual(401);
    });
  });
});
