import * as request from 'supertest';
import { createTestApp } from '../utils/bootstrap';

describe('UserCoreController (reads)', () => {
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

  describe('GET /users/me', () => {
    it('returns current user', async () => {
      // given
      const { user, token } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .get('/users/me')
        .set('authorization', `Bearer ${token}`);

      // then
      expect(response.body).toMatchObject({ id: expect.any(String), email: user.email });
    });

    it('returns 401 when not logged in', async () => {
      // when
      const response = await request(bootstrap.app.getHttpServer()).get('/users/me');

      // then
      expect(response.status).toEqual(401);
    });
  });

  describe('POST /users/public-keys', () => {
    it('returns public keys', async () => {
      // given
      const { user: user1, token } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });
      const { user: user2 } = await bootstrap.utils.userUtils.createDefault({
        email: 'test2@test.com',
      });

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .post('/users/public-keys')
        .send({
          userIds: [user1.id, user2.id],
        })
        .set('authorization', `Bearer ${token}`);

      // then
      expect(response.body.publicKeys).toEqual({
        [user1.id]: user1.publicKey,
        [user2.id]: user2.publicKey,
      });
    });

    it('returns 401 when not logged in', async () => {
      // when
      const response = await request(bootstrap.app.getHttpServer()).post('/users/public-keys');

      // then
      expect(response.status).toEqual(401);
    });
  });

  describe('GET /users/suggested', () => {
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

      await bootstrap.utils.projectUtils.addMemberToProject(project1.id, user2.id);
      await bootstrap.utils.projectUtils.addMemberToProject(project2.id, user2.id);
      await bootstrap.utils.projectUtils.addMemberToProject(project3.id, user2.id);

      await bootstrap.utils.projectUtils.addMemberToProject(project1.id, user3.id);
      await bootstrap.utils.projectUtils.addMemberToProject(project2.id, user3.id);

      await bootstrap.utils.projectUtils.addMemberToProject(project1.id, user4.id);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .get('/users/suggested')
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

    it('returns empty list when user has no projects', async () => {
      // given
      const { token } = await bootstrap.utils.userUtils.createDefault({
        email: 'user1@test.com',
      });

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .get('/users/suggested')
        .set('authorization', `Bearer ${token}`);

      // then
      expect(response.status).toEqual(200);
      expect(response.body).toEqual([]);
    });

    it('excludes current user from suggestions', async () => {
      // given
      const { user: user1, token: token1 } = await bootstrap.utils.userUtils.createDefault({
        email: 'user1@test.com',
      });
      const { user: user2 } = await bootstrap.utils.userUtils.createDefault({
        email: 'user2@test.com',
      });

      const project = await bootstrap.utils.projectUtils.createProject(token1);
      await bootstrap.utils.projectUtils.addMemberToProject(project.id, user2.id);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .get('/users/suggested')
        .set('authorization', `Bearer ${token1}`);

      // then
      expect(response.status).toEqual(200);
      expect(response.body).toHaveLength(1);
      expect(response.body.find((u: any) => u.id === user1.id)).toBeUndefined();
      expect(response.body[0].id).toEqual(user2.id);
    });

    it('returns 401 when not logged in', async () => {
      // when
      const response = await request(bootstrap.app.getHttpServer()).get('/users/suggested');

      // then
      expect(response.status).toEqual(401);
    });
  });
});
