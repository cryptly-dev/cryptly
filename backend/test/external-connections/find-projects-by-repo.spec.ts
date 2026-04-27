import * as request from 'supertest';
import { GithubExternalConnectionClientService } from '../../src/external-connection/github/client/github-external-connection-client.service';
import { createTestApp } from '../utils/bootstrap';

describe('GithubExternalConnectionCoreController (find-projects-by-repo)', () => {
  let bootstrap: Awaited<ReturnType<typeof createTestApp>>;
  let clientMock: jest.Mocked<GithubExternalConnectionClientService>;

  beforeAll(async () => {
    bootstrap = await createTestApp();
  });

  beforeEach(async () => {
    await bootstrap.methods.beforeEach();
    clientMock = bootstrap.app.get(GithubExternalConnectionClientService);

    clientMock.getRepositoryPublicKey.mockResolvedValue({
      key: 'k',
      keyId: 'kid',
    });
  });

  afterAll(async () => {
    await bootstrap.methods.afterAll();
  });

  describe('GET /users/me/external-connections/github/find-projects-by-repo', () => {
    it('returns projects whose integration matches the given owner/name', async () => {
      // given
      const setup = await bootstrap.utils.userUtils.createDefault({ email: 'a@b.com' });
      const project = await bootstrap.utils.projectUtils.createProject(setup.token);
      const installation = await bootstrap.utils.githubExternalConnectionUtils.createInstallation(
        setup.token,
        100,
      );

      clientMock.getRepositoryInfoByInstallationIdAndRepositoryId.mockResolvedValue({
        id: 1,
        owner: 'cryptly-dev',
        name: 'cryptly',
        avatarUrl: 'x',
        url: 'x',
        isPrivate: false,
      });

      await bootstrap.utils.githubExternalConnectionUtils.createIntegration(setup.token, {
        repositoryId: 1,
        installationEntityId: installation.id,
        projectId: project.id,
      });

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .get('/users/me/external-connections/github/find-projects-by-repo')
        .query({ owner: 'cryptly-dev', name: 'cryptly' })
        .set('authorization', `Bearer ${setup.token}`);

      // then
      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        {
          projectId: project.id,
          projectName: project.name,
          integrationCount: 1,
        },
      ]);
    });

    it('returns an empty array when no project matches', async () => {
      // given
      const setup = await bootstrap.utils.userUtils.createDefault({ email: 'a@b.com' });
      const project = await bootstrap.utils.projectUtils.createProject(setup.token);
      const installation = await bootstrap.utils.githubExternalConnectionUtils.createInstallation(
        setup.token,
        100,
      );

      clientMock.getRepositoryInfoByInstallationIdAndRepositoryId.mockResolvedValue({
        id: 1,
        owner: 'cryptly-dev',
        name: 'cryptly',
        avatarUrl: 'x',
        url: 'x',
        isPrivate: false,
      });

      await bootstrap.utils.githubExternalConnectionUtils.createIntegration(setup.token, {
        repositoryId: 1,
        installationEntityId: installation.id,
        projectId: project.id,
      });

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .get('/users/me/external-connections/github/find-projects-by-repo')
        .query({ owner: 'someone', name: 'else' })
        .set('authorization', `Bearer ${setup.token}`);

      // then
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('skips projects that have no integrations', async () => {
      // given
      const setup = await bootstrap.utils.userUtils.createDefault({ email: 'a@b.com' });
      await bootstrap.utils.projectUtils.createProject(setup.token);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .get('/users/me/external-connections/github/find-projects-by-repo')
        .query({ owner: 'cryptly-dev', name: 'cryptly' })
        .set('authorization', `Bearer ${setup.token}`);

      // then
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('returns 400 when owner or name is missing', async () => {
      // given
      const setup = await bootstrap.utils.userUtils.createDefault({ email: 'a@b.com' });

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .get('/users/me/external-connections/github/find-projects-by-repo')
        .query({ owner: 'cryptly-dev' })
        .set('authorization', `Bearer ${setup.token}`);

      // then
      expect(response.status).toBe(400);
    });

    it('returns 401 when not authenticated', async () => {
      // when
      const response = await request(bootstrap.app.getHttpServer())
        .get('/users/me/external-connections/github/find-projects-by-repo')
        .query({ owner: 'cryptly-dev', name: 'cryptly' });

      // then
      expect(response.status).toBe(401);
    });
  });
});
