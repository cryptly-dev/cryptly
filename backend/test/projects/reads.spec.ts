import * as request from 'supertest';
import { createTestApp, TestApp } from '../utils/bootstrap';

describe('ProjectCoreController (reads)', () => {
  let bootstrap: TestApp;

  beforeAll(async () => {
    bootstrap = await createTestApp();
  });

  beforeEach(async () => {
    await bootstrap.methods.beforeEach();
  });

  afterAll(async () => {
    await bootstrap.methods.afterAll();
  });

  describe('GET /projects/:projectId', () => {
    it('gets project when owner', async () => {
      // given
      const { user, token } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(token);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .get(`/projects/${project.id}`)
        .set('authorization', `Bearer ${token}`);

      // then
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        id: project.id,
        name: 'test-project',
        members: [{ id: user.id, email: user.email, avatarUrl: user.avatarUrl, role: 'admin' }],
        encryptedSecretsKeys: {},
        encryptedSecrets: '',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('gets project when a read member', async () => {
      const { user: admin, token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: readUser, token: readToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'read@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);
      await bootstrap.utils.projectUtils.addMemberToProject(project.id, readUser.id);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .get(`/projects/${project.id}`)
        .set('authorization', `Bearer ${readToken}`);

      // then
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        id: project.id,
        name: 'test-project',
        members: [
          { id: admin.id, email: admin.email, avatarUrl: admin.avatarUrl, role: 'admin' },
          { id: readUser.id, email: readUser.email, avatarUrl: readUser.avatarUrl, role: 'read' },
        ],
        encryptedSecretsKeys: {},
        encryptedSecrets: '',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('does not get when not a member', async () => {
      const { token } = await bootstrap.utils.userUtils.createDefault({ email: 'test@test.com' });
      const { token: otherToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'testB@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(token);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .get(`/projects/${project.id}`)
        .set('authorization', `Bearer ${otherToken}`);

      // then
      expect(response.status).toEqual(403);
    });

    it('does not get when not logged in', async () => {
      const { token } = await bootstrap.utils.userUtils.createDefault({ email: 'test@test.com' });
      const project = await bootstrap.utils.projectUtils.createProject(token);

      // when
      const response = await request(bootstrap.app.getHttpServer()).get(`/projects/${project.id}`);

      // then
      expect(response.status).toEqual(401);
    });
  });
  describe('GET /users/me/projects', () => {
    it('gets projects for user', async () => {
      // given
      const { user, token } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });
      const projectA = await bootstrap.utils.projectUtils.createProject(token, {
        name: 'project-a',
        encryptedSecretsKeys: {},
        encryptedSecrets: '',
      });
      const projectB = await bootstrap.utils.projectUtils.createProject(token, {
        name: 'project-b',
        encryptedSecretsKeys: {},
        encryptedSecrets: '',
      });

      const { token: tokenB } = await bootstrap.utils.userUtils.createDefault({
        email: 'testB@test.com',
      });
      await bootstrap.utils.projectUtils.createProject(tokenB, {
        name: 'project-c',
        encryptedSecretsKeys: {},
        encryptedSecrets: '',
      });

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .get(`/users/me/projects`)
        .set('authorization', `Bearer ${token}`);

      // then
      expect(response.status).toEqual(200);
      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(
        expect.arrayContaining([
          {
            id: projectA.id,
            name: 'project-a',
            members: [{ id: user.id, email: user.email, avatarUrl: user.avatarUrl, role: 'admin' }],
            encryptedSecretsKeys: {},
            encryptedSecrets: '',
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
          {
            id: projectB.id,
            name: 'project-b',
            members: [{ id: user.id, email: user.email, avatarUrl: user.avatarUrl, role: 'admin' }],
            encryptedSecretsKeys: {},
            encryptedSecrets: '',
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        ]),
      );
    });

    it('returns empty array when no projects', async () => {
      // given
      const { token } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .get(`/users/me/projects`)
        .set('authorization', `Bearer ${token}`);

      // then
      expect(response.status).toEqual(200);
      expect(response.body).toEqual([]);
    });

    it('does not get when not logged in', async () => {
      // when
      const response = await request(bootstrap.app.getHttpServer()).get(`/users/me/projects`);

      // then
      expect(response.status).toEqual(401);
    });
  });

  describe('GET /projects/:projectId/history', () => {
    it('gets project history', async () => {
      // given
      const { user, token } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(token, {
        name: 'test-project',
        encryptedSecretsKeys: {},
        encryptedSecrets: 'v1',
      });

      await request(bootstrap.app.getHttpServer())
        .patch(`/projects/${project.id}`)
        .set('authorization', `Bearer ${token}`)
        .send({ encryptedSecrets: 'v2' });
      await request(bootstrap.app.getHttpServer())
        .patch(`/projects/${project.id}`)
        .set('authorization', `Bearer ${token}`)
        .send({ encryptedSecrets: 'v3' });

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .get(`/projects/${project.id}/history`)
        .set('authorization', `Bearer ${token}`);

      // then
      expect(response.status).toEqual(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].encryptedSecrets).toEqual('v3');
      expect(response.body[0].author.id).toEqual(user.id);
      expect(response.body[1].encryptedSecrets).toEqual('v2');
      expect(response.body[1].author.id).toEqual(user.id);
    });
  });

  describe('GET /projects/:projectId/suggested-users', () => {
    it('returns suggested users sorted by shared project count', async () => {
      // given
      const { user: user1, token: token1 } = await bootstrap.utils.userUtils.createDefault({
        email: 'user1@test.com',
      });
      const { user: user2 } = await bootstrap.utils.userUtils.createDefault({
        email: 'user2@test.com',
      });
      const { user: user3 } = await bootstrap.utils.userUtils.createDefault({
        email: 'user3@test.com',
      });
      const { user: user4 } = await bootstrap.utils.userUtils.createDefault({
        email: 'user4@test.com',
      });

      const project1 = await bootstrap.utils.projectUtils.createProject(token1);
      const project2 = await bootstrap.utils.projectUtils.createProject(token1);
      const project3 = await bootstrap.utils.projectUtils.createProject(token1);

      await bootstrap.utils.projectUtils.addMemberToProject(project2.id, user2.id);
      await bootstrap.utils.projectUtils.addMemberToProject(project3.id, user2.id);

      await bootstrap.utils.projectUtils.addMemberToProject(project2.id, user3.id);

      await bootstrap.utils.projectUtils.addMemberToProject(project3.id, user4.id);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .get(`/projects/${project1.id}/suggested-users`)
        .set('authorization', `Bearer ${token1}`);

      // then
      expect(response.status).toEqual(200);
      expect(response.body).toHaveLength(3);
      expect(response.body[0]).toMatchObject({
        id: user2.id,
        email: user2.email,
        avatarUrl: user2.avatarUrl,
      });
      expect(response.body[1]).toMatchObject({
        id: user3.id,
        email: user3.email,
        avatarUrl: user3.avatarUrl,
      });
      expect(response.body[2]).toMatchObject({
        id: user4.id,
        email: user4.email,
        avatarUrl: user4.avatarUrl,
      });
    });

    it('returns empty list when user has no other project collaborators', async () => {
      // given
      const { token } = await bootstrap.utils.userUtils.createDefault({
        email: 'user1@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(token);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .get(`/projects/${project.id}/suggested-users`)
        .set('authorization', `Bearer ${token}`);

      // then
      expect(response.status).toEqual(200);
      expect(response.body).toEqual([]);
    });

    it('excludes existing project members', async () => {
      // given
      const { user: user1, token: token1 } = await bootstrap.utils.userUtils.createDefault({
        email: 'user1@test.com',
      });
      const { user: user2 } = await bootstrap.utils.userUtils.createDefault({
        email: 'user2@test.com',
      });
      const { user: user3 } = await bootstrap.utils.userUtils.createDefault({
        email: 'user3@test.com',
      });

      const project1 = await bootstrap.utils.projectUtils.createProject(token1);
      const project2 = await bootstrap.utils.projectUtils.createProject(token1);

      await bootstrap.utils.projectUtils.addMemberToProject(project1.id, user2.id);
      await bootstrap.utils.projectUtils.addMemberToProject(project2.id, user2.id);

      await bootstrap.utils.projectUtils.addMemberToProject(project1.id, user3.id);
      await bootstrap.utils.projectUtils.addMemberToProject(project2.id, user3.id);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .get(`/projects/${project1.id}/suggested-users`)
        .set('authorization', `Bearer ${token1}`);

      // then
      expect(response.status).toEqual(200);
      expect(response.body).toHaveLength(0);
    });

    it('excludes users with pending personal invitations', async () => {
      // given
      const { user: user1, token: token1 } = await bootstrap.utils.userUtils.createDefault({
        email: 'user1@test.com',
      });
      const { user: user2 } = await bootstrap.utils.userUtils.createDefault({
        email: 'user2@test.com',
      });
      const { user: user3 } = await bootstrap.utils.userUtils.createDefault({
        email: 'user3@test.com',
      });

      const project1 = await bootstrap.utils.projectUtils.createProject(token1);
      const project2 = await bootstrap.utils.projectUtils.createProject(token1);

      await bootstrap.utils.projectUtils.addMemberToProject(project1.id, user2.id);
      await bootstrap.utils.projectUtils.addMemberToProject(project2.id, user2.id);

      await bootstrap.utils.projectUtils.addMemberToProject(project2.id, user3.id);

      await bootstrap.utils.personalInvitationUtils.createPersonalInvitation(
        token1,
        user2.id,
        project1.id,
      );

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .get(`/projects/${project1.id}/suggested-users`)
        .set('authorization', `Bearer ${token1}`);

      // then
      expect(response.status).toEqual(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toEqual(user3.id);
    });

    it('returns 403 when user is not admin', async () => {
      // given
      const { token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { token: readToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'read@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);
      await bootstrap.utils.projectUtils.addMemberToProject(project.id, readToken);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .get(`/projects/${project.id}/suggested-users`)
        .set('authorization', `Bearer ${readToken}`);

      // then
      expect(response.status).toEqual(403);
    });

    it('returns 403 when user from different cluster tries to access', async () => {
      // given
      const { token: tokenA } = await bootstrap.utils.userUtils.createDefault({
        email: 'userA@test.com',
      });
      const { token: tokenB } = await bootstrap.utils.userUtils.createDefault({
        email: 'userB@test.com',
      });
      const projectA = await bootstrap.utils.projectUtils.createProject(tokenA);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .get(`/projects/${projectA.id}/suggested-users`)
        .set('authorization', `Bearer ${tokenB}`);

      // then
      expect(response.status).toEqual(403);
    });

    it('returns 401 when not logged in', async () => {
      // when
      const response = await request(bootstrap.app.getHttpServer()).get(
        '/projects/507f1f77bcf86cd799439011/suggested-users',
      );

      // then
      expect(response.status).toEqual(401);
    });

    it('excludes users without public keys', async () => {
      // given
      const { user: user1, token: token1 } = await bootstrap.utils.userUtils.createDefault({
        email: 'user1@test.com',
      });
      const { user: user2 } = await bootstrap.utils.userUtils.createDefault({
        email: 'user2@test.com',
      });

      await bootstrap.models.userModel.updateOne({ _id: user2.id }, { $unset: { publicKey: '' } });

      const project1 = await bootstrap.utils.projectUtils.createProject(token1);
      const project2 = await bootstrap.utils.projectUtils.createProject(token1);

      await bootstrap.utils.projectUtils.addMemberToProject(project2.id, user2.id);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .get(`/projects/${project1.id}/suggested-users`)
        .set('authorization', `Bearer ${token1}`);

      // then
      expect(response.status).toEqual(200);
      expect(response.body).toHaveLength(0);
    });
  });
});
