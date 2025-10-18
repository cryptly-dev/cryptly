import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from '../utils/bootstrap';

describe('User writes (e2e)', () => {
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

  describe('PATCH /users/me', () => {
    it('updates own keys', async () => {
      // given
      const { user, token } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .patch(`/users/me`)
        .set('authorization', `Bearer ${token}`)
        .send({ publicKey: 'test-public-key', privateKeyEncrypted: 'test-private-key' });

      // then
      expect(response.status).toEqual(HttpStatus.OK);
      expect(response.body).toMatchObject({
        publicKey: 'test-public-key',
        privateKeyEncrypted: 'test-private-key',
      });
    });

    it('does not update if not logged in', async () => {
      // when
      const response = await request(bootstrap.app.getHttpServer())
        .patch(`/users/me`)
        .send({ publicKey: 'test-public-key', privateKeyEncrypted: 'test-private-key' });

      // then
      expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it('updates projectsOrder', async () => {
      // given
      const { user, token } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });

      const project1 = await bootstrap.utils.projectUtils.createProject(token, {
        name: 'project-1',
        encryptedSecrets: '',
        encryptedSecretsKeys: {},
      });

      const project2 = await bootstrap.utils.projectUtils.createProject(token, {
        name: 'project-2',
        encryptedSecrets: '',
        encryptedSecretsKeys: {},
      });

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .patch(`/users/me`)
        .set('authorization', `Bearer ${token}`)
        .send({ projectsOrder: [project2.id, project1.id] });

      // then
      expect(response.status).toEqual(HttpStatus.OK);
      const userFromDb = await bootstrap.models.userModel.findById(user.id).lean();
      expect(userFromDb?.projectsOrder).toEqual([project2.id, project1.id]);
    });

    it('updates displayName', async () => {
      // given
      const { user, token } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .patch(`/users/me`)
        .set('authorization', `Bearer ${token}`)
        .send({ displayName: 'John Doe' });

      // then
      expect(response.status).toEqual(HttpStatus.OK);
      expect(response.body).toMatchObject({
        displayName: 'John Doe',
      });
      const userFromDb = await bootstrap.models.userModel.findById(user.id).lean();
      expect(userFromDb?.displayName).toEqual('John Doe');
    });
  });
});
