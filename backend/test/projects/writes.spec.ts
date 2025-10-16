import { advanceBy, advanceTo } from 'jest-date-mock';
import { firstValueFrom, of } from 'rxjs';
import { catchError, take, timeout, toArray } from 'rxjs/operators';
import * as request from 'supertest';
import { ProjectCoreController } from '../../src/project/core/project-core.controller';
import { ENCRYPTED_SECRETS_MAX_LENGTH } from '../../src/shared/constants/validation';
import { Role } from '../../src/shared/types/role.enum';
import { createTestApp } from '../utils/bootstrap';
import { describe } from 'node:test';

describe('ProjectCoreController (writes)', () => {
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

  describe('POST /projects', () => {
    it('creates project', async () => {
      // given
      const { user, token } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .post('/projects')
        .set('authorization', `Bearer ${token}`)
        .send({ name: 'test-project', encryptedSecrets: '', encryptedSecretsKeys: {} });

      // then
      expect(response.status).toEqual(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        name: 'test-project',
        members: [{ id: user.id, email: user.email, avatarUrl: user.avatarUrl, role: 'admin' }],
        encryptedSecretsKeys: {},
        encryptedSecrets: '',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('does not create when not logged in', async () => {
      // when
      const response = await request(bootstrap.app.getHttpServer())
        .post('/projects')
        .send({ name: 'test-project', encryptedSecrets: '', encryptedPassphrase: '' });

      // then
      expect(response.status).toEqual(401);
    });

    it('does not create when encryptedSecrets is too long', async () => {
      // given
      const { token } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });
      const longSecrets = 'a'.repeat(ENCRYPTED_SECRETS_MAX_LENGTH + 1);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .post('/projects')
        .set('authorization', `Bearer ${token}`)
        .send({ name: 'test-project', encryptedSecrets: longSecrets, encryptedSecretsKeys: {} });

      // then
      expect(response.status).toEqual(400);
    });
  });

  describe('PATCH /projects/:projectId', () => {
    it('updates project', async () => {
      // given
      const { user, token } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(token, {
        name: 'old-name',
        encryptedSecrets: '',
        encryptedSecretsKeys: {},
      });

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .patch(`/projects/${project.id}`)
        .set('authorization', `Bearer ${token}`)
        .send({
          name: 'new-name',
          encryptedSecrets: 'new-secrets',
        });

      // then
      expect(response.status).toEqual(200);
      expect(response.body).toMatchObject({
        id: project.id,
        name: 'new-name',
        encryptedSecrets: 'new-secrets',
      });
    });

    it('does not update project when a read role', async () => {
      // given
      const { token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: readUser, token: readToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'read@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken, {
        name: 'old-name',
        encryptedSecretsKeys: {},
        encryptedSecrets: '',
      });

      await bootstrap.utils.projectUtils.addMemberToProject(project.id, readUser.id, Role.Read);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .patch(`/projects/${project.id}`)
        .set('authorization', `Bearer ${readToken}`)
        .send({
          encryptedSecrets: 'new-secrets',
        });

      // then
      expect(response.status).toEqual(403);
    });

    it('does not update when not member', async () => {
      // given
      const { token } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(token);
      const { token: tokenB } = await bootstrap.utils.userUtils.createDefault({
        email: 'testB@test.com',
      });

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .patch(`/projects/${project.id}`)
        .set('authorization', `Bearer ${tokenB}`)
        .send({ name: 'new-name' });

      // then
      expect(response.status).toEqual(403);
    });

    it('does not update project name when read/write but allows admin', async () => {
      // given
      const { token: adminToken, project } = await bootstrap.utils.projectUtils.setupAdmin();
      const { user: readUser, token: readToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'read@test.com',
      });
      const { user: writeUser, token: writeToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'write@test.com',
      });
      await bootstrap.utils.projectUtils.addMemberToProject(project.id, readUser.id, Role.Read);
      await bootstrap.utils.projectUtils.addMemberToProject(project.id, writeUser.id, Role.Write);

      const readResponse = await request(bootstrap.app.getHttpServer())
        .patch(`/projects/${project.id}`)
        .set('authorization', `Bearer ${readToken}`)
        .send({ name: 'new-name' });

      expect(readResponse.status).toEqual(403);

      const writeResponse = await request(bootstrap.app.getHttpServer())
        .patch(`/projects/${project.id}`)
        .set('authorization', `Bearer ${writeToken}`)
        .send({ name: 'new-name' });

      expect(writeResponse.status).toEqual(403);

      const adminResponse = await request(bootstrap.app.getHttpServer())
        .patch(`/projects/${project.id}`)
        .set('authorization', `Bearer ${adminToken}`)
        .send({ name: 'new-name' });

      expect(adminResponse.status).toEqual(200);
    });

    it('does not update when not logged in', async () => {
      // given
      const { token } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(token);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .patch(`/projects/${project.id}`)
        .send({ name: 'new-name' });

      // then
      expect(response.status).toEqual(401);
    });

    it('does not update when encryptedSecrets is too long', async () => {
      // given
      const { token } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(token);
      const longSecrets = 'a'.repeat(ENCRYPTED_SECRETS_MAX_LENGTH + 1);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .patch(`/projects/${project.id}`)
        .set('authorization', `Bearer ${token}`)
        .send({ encryptedSecrets: longSecrets });

      // then
      expect(response.status).toEqual(400);
    });

    it('project is updated when secrets change', async () => {
      // given
      const { user, token } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });
      // set current time
      advanceTo('2025-09-23T00:00:00.000Z');
      const project = await bootstrap.utils.projectUtils.createProject(token);

      // when
      advanceBy(3600 * 1000); // 1 hour
      const response = await request(bootstrap.app.getHttpServer())
        .patch(`/projects/${project.id}`)
        .set('authorization', `Bearer ${token}`)
        .send({ encryptedSecrets: 'new-secrets' });

      // then
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        id: project.id,
        name: 'test-project',
        members: [{ id: user.id, email: user.email, avatarUrl: user.avatarUrl, role: 'admin' }],
        encryptedSecretsKeys: {},
        encryptedSecrets: 'new-secrets',
        createdAt: expect.any(String),
        updatedAt: '2025-09-23T01:00:00.000Z',
      });
    });
  });

  describe('PATCH /projects/:projectId/members/:memberId', () => {
    it('admin updates a read member to write', async () => {
      // given
      const {
        user: admin,
        token: adminToken,
        project,
      } = await bootstrap.utils.projectUtils.setupAdmin();
      const { user: readUser } = await bootstrap.utils.userUtils.createDefault({
        email: 'read@test.com',
      });
      await bootstrap.utils.projectUtils.addMemberToProject(project.id, readUser.id, Role.Read);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .patch(`/projects/${project.id}/members/${readUser.id}`)
        .set('authorization', `Bearer ${adminToken}`)
        .send({ role: Role.Write });

      // then
      expect(response.status).toEqual(204);
      const updatedProject = await bootstrap.utils.projectUtils.getProject(project.id, adminToken);
      expect(updatedProject.members).toEqual([
        { id: admin.id, email: admin.email, avatarUrl: admin.avatarUrl, role: 'admin' },
        { id: readUser.id, email: readUser.email, avatarUrl: readUser.avatarUrl, role: 'write' },
      ]);
    });

    it('write cannot update a member role', async () => {
      // given
      const { write, token: writeToken, project } = await bootstrap.utils.projectUtils.setupWrite();
      const { user: readUser } = await bootstrap.utils.userUtils.createDefault({
        email: 'read@test.com',
      });
      await bootstrap.utils.projectUtils.addMemberToProject(project.id, readUser.id, Role.Read);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .patch(`/projects/${project.id}/members/${readUser.id}`)
        .set('authorization', `Bearer ${writeToken}`)
        .send({ role: Role.Write });

      // then
      expect(response.status).toEqual(403);
    });

    it('admin can update a read member to admin', async () => {
      // given
      const {
        user: admin,
        token: adminToken,
        project,
      } = await bootstrap.utils.projectUtils.setupAdmin();
      const { user: readUser } = await bootstrap.utils.userUtils.createDefault({
        email: 'read@test.com',
      });
      await bootstrap.utils.projectUtils.addMemberToProject(project.id, readUser.id, Role.Read);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .patch(`/projects/${project.id}/members/${readUser.id}`)
        .set('authorization', `Bearer ${adminToken}`)
        .send({ role: Role.Admin });

      // then
      expect(response.status).toEqual(204);
      const updatedProject = await bootstrap.utils.projectUtils.getProject(project.id, adminToken);
      expect(updatedProject.members).toEqual([
        { id: admin.id, email: admin.email, avatarUrl: admin.avatarUrl, role: 'admin' },
        { id: readUser.id, email: readUser.email, avatarUrl: readUser.avatarUrl, role: 'admin' },
      ]);
    });
  });

  describe('DELETE /projects/:projectId', () => {
    it('deletes project', async () => {
      // given
      const { token } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(token);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .delete(`/projects/${project.id}`)
        .set('authorization', `Bearer ${token}`);

      // then
      expect(response.status).toEqual(204);
    });

    it('does not delete when not owner', async () => {
      // given
      const { token } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(token);
      const { token: tokenB } = await bootstrap.utils.userUtils.createDefault({
        email: 'testB@test.com',
      });

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .delete(`/projects/${project.id}`)
        .set('authorization', `Bearer ${tokenB}`);

      // then
      expect(response.status).toEqual(403);
    });

    it('does not delete when a read member', async () => {
      // given
      const { token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: readUser, token: readToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'read@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);
      await bootstrap.utils.projectUtils.addMemberToProject(project.id, readUser.id, Role.Read);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .delete(`/projects/${project.id}`)
        .set('authorization', `Bearer ${readToken}`);

      // then
      expect(response.status).toEqual(403);
    });

    it('does not delete when a write member', async () => {
      // given
      const { token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: writeUser, token: writeToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'write@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);
      await bootstrap.utils.projectUtils.addMemberToProject(project.id, writeUser.id, Role.Write);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .delete(`/projects/${project.id}`)
        .set('authorization', `Bearer ${writeToken}`);

      // then
      expect(response.status).toEqual(403);
    });

    it('does not delete when not logged in', async () => {
      // given
      const { token } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(token);

      // when
      const response = await request(bootstrap.app.getHttpServer()).delete(
        `/projects/${project.id}`,
      );

      // then
      expect(response.status).toEqual(401);
    });
  });

  describe('DELETE /projects/:projectId/members/:memberId', () => {
    it('admin removes a read member', async () => {
      // given
      const { user: admin, token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: readUser } = await bootstrap.utils.userUtils.createDefault({
        email: 'read@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);
      await bootstrap.utils.projectUtils.addMemberToProject(project.id, readUser.id, Role.Read);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .delete(`/projects/${project.id}/members/${readUser.id}`)
        .set('authorization', `Bearer ${adminToken}`);

      // then
      expect(response.status).toEqual(204);
      const updatedProject = await bootstrap.utils.projectUtils.getProject(project.id, adminToken);
      expect(updatedProject.members).toEqual([
        { id: admin.id, email: admin.email, avatarUrl: admin.avatarUrl, role: 'admin' },
      ]);
    });

    it('admin removes another admin', async () => {
      // given
      const { user: adminA, token: adminAToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'adminA@test.com',
      });
      const { user: adminB } = await bootstrap.utils.userUtils.createDefault({
        email: 'adminB@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminAToken);
      await bootstrap.utils.projectUtils.addMemberToProject(project.id, adminB.id, Role.Admin);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .delete(`/projects/${project.id}/members/${adminB.id}`)
        .set('authorization', `Bearer ${adminAToken}`);

      // then
      expect(response.status).toEqual(204);
      const updatedProject = await bootstrap.utils.projectUtils.getProject(project.id, adminAToken);
      expect(updatedProject.members).toEqual([
        { id: adminA.id, email: adminA.email, avatarUrl: adminA.avatarUrl, role: 'admin' },
      ]);
    });

    it('admin removes a write member', async () => {
      // given
      const { user: admin, token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: writeUser } = await bootstrap.utils.userUtils.createDefault({
        email: 'write@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);
      await bootstrap.utils.projectUtils.addMemberToProject(project.id, writeUser.id, Role.Write);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .delete(`/projects/${project.id}/members/${writeUser.id}`)
        .set('authorization', `Bearer ${adminToken}`);

      // then
      expect(response.status).toEqual(204);
      const updatedProject = await bootstrap.utils.projectUtils.getProject(project.id, adminToken);
      expect(updatedProject.members).toEqual([
        { id: admin.id, email: admin.email, avatarUrl: admin.avatarUrl, role: 'admin' },
      ]);
    });

    it('read member removes themself', async () => {
      // given
      const { user: admin, token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: readUser, token: readToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'read@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);
      await bootstrap.utils.projectUtils.addMemberToProject(project.id, readUser.id, Role.Read);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .delete(`/projects/${project.id}/members/${readUser.id}`)
        .set('authorization', `Bearer ${readToken}`);

      // then
      expect(response.status).toEqual(204);
      const updatedProject = await bootstrap.utils.projectUtils.getProject(project.id, adminToken);
      expect(updatedProject.members).toEqual([
        { id: admin.id, email: admin.email, avatarUrl: admin.avatarUrl, role: 'admin' },
      ]);
    });

    it('read member cannot remove admin', async () => {
      // given
      const { user: admin, token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: readUser, token: readToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'read@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);
      await bootstrap.utils.projectUtils.addMemberToProject(project.id, readUser.id, Role.Read);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .delete(`/projects/${project.id}/members/${admin.id}`)
        .set('authorization', `Bearer ${readToken}`);

      // then
      expect(response.status).toEqual(403);
    });

    it('read member cannot remove another read member', async () => {
      // given
      const { token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: readA, token: readAToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'readA@test.com',
      });
      const { user: readB } = await bootstrap.utils.userUtils.createDefault({
        email: 'readB@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);
      await bootstrap.utils.projectUtils.addMemberToProject(project.id, readA.id, Role.Read);
      await bootstrap.utils.projectUtils.addMemberToProject(project.id, readB.id, Role.Read);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .delete(`/projects/${project.id}/members/${readB.id}`)
        .set('authorization', `Bearer ${readAToken}`);

      // then
      expect(response.status).toEqual(403);
    });

    it('write member cannot remove admin', async () => {
      // given
      const { write, token: writeToken, project } = await bootstrap.utils.projectUtils.setupWrite();
      const { user: admin } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .delete(`/projects/${project.id}/members/${admin.id}`)
        .set('authorization', `Bearer ${writeToken}`);

      // then
      expect(response.status).toEqual(403);
    });

    it('random user cannot remove anyone', async () => {
      // given
      const { token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: readUser } = await bootstrap.utils.userUtils.createDefault({
        email: 'read@test.com',
      });
      const { token: randomToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'random@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);
      await bootstrap.utils.projectUtils.addMemberToProject(project.id, readUser.id, Role.Read);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .delete(`/projects/${project.id}/members/${readUser.id}`)
        .set('authorization', `Bearer ${randomToken}`);

      // then
      expect(response.status).toEqual(403);
    });

    it('does not remove when not logged in', async () => {
      // given
      const { user: member, token } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(token);

      // when
      const response = await request(bootstrap.app.getHttpServer()).delete(
        `/projects/${project.id}/members/${member.id}`,
      );

      // then
      expect(response.status).toEqual(401);
    });
  });

  describe('GET /projects/:projectId/events', () => {
    it('receives secrets updates events for the specified project', async () => {
      // given
      const { user, token, project } = await bootstrap.utils.projectUtils.setupOwner();
      const projectCoreController = bootstrap.app.get(ProjectCoreController);

      // when
      const stream = await projectCoreController.streamEvents(project.id);
      const resultsPromise = firstValueFrom(stream.pipe(take(2), toArray()));

      await request(bootstrap.app.getHttpServer())
        .patch(`/projects/${project.id}`)
        .set('authorization', `Bearer ${token}`)
        .send({
          encryptedSecrets: 'new-secrets-for-sse',
        });

      await request(bootstrap.app.getHttpServer())
        .patch(`/projects/${project.id}`)
        .set('authorization', `Bearer ${token}`)
        .send({
          encryptedSecrets: 'new-secrets-for-sse-2',
        });

      // then
      const results = await resultsPromise;

      expect(results[0].data).toMatchObject({
        newEncryptedSecrets: 'new-secrets-for-sse',
        user: {
          id: user.id,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
      });

      expect(results[1].data).toMatchObject({
        newEncryptedSecrets: 'new-secrets-for-sse-2',
        user: {
          id: user.id,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
      });
    });

    it('does not receive secrets updates events for other projects', async () => {
      // given
      const { project: projectA } = await bootstrap.utils.projectUtils.setupOwner();
      const { token: tokenB, project: projectB } = await bootstrap.utils.projectUtils.setupOwner();

      const projectCoreController = bootstrap.app.get(ProjectCoreController);

      const streamA = await projectCoreController.streamEvents(projectA.id);
      const resultsPromiseA = firstValueFrom(
        streamA.pipe(
          take(1),
          timeout(1000),
          catchError(() => of(null)),
        ),
      );

      // when
      await request(bootstrap.app.getHttpServer())
        .patch(`/projects/${projectB.id}`)
        .set('authorization', `Bearer ${tokenB}`)
        .send({
          encryptedSecrets: 'new-secrets-for-sse',
        });

      // then
      const result = await resultsPromiseA;
      expect(result).toBeNull();
    });

    it('does not receive secrets when not logged in', async () => {
      // given
      const { project } = await bootstrap.utils.projectUtils.setupOwner();

      // when
      const response = await request(bootstrap.app.getHttpServer()).get(
        `/projects/${project.id}/events`,
      );

      // then
      expect(response.status).toEqual(401);
    });
  });

  describe('POST /projects/:projectId/encrypted-secrets-keys', () => {
    it('adds encrypted secrets key as admin', async () => {
      // given
      const { token } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });

      const { user: otherUser } = await bootstrap.utils.userUtils.createDefault({
        email: 'other@test.com',
      });

      const project = await bootstrap.utils.projectUtils.createProject(token);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .post(`/projects/${project.id}/encrypted-secrets-keys`)
        .set('authorization', `Bearer ${token}`)
        .send({ userId: otherUser.id, encryptedSecretsKey: 'encryptedSecretsKey' });

      // then
      expect(response.status).toEqual(204);
      const updatedProject = await bootstrap.utils.projectUtils.getProject(project.id, token);
      expect(updatedProject.encryptedSecretsKeys).toEqual({
        [otherUser.id]: 'encryptedSecretsKey',
      });
    });

    it('does not add encrypted secrets key when not admin', async () => {
      // given
      const { token } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });

      const { user: writeUser, token: writeToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'write@test.com',
      });

      const { user: otherUser } = await bootstrap.utils.userUtils.createDefault({
        email: 'other@test.com',
      });

      const project = await bootstrap.utils.projectUtils.createProject(token);
      await bootstrap.utils.projectUtils.addMemberToProject(project.id, writeUser.id, Role.Write);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .post(`/projects/${project.id}/encrypted-secrets-keys`)
        .set('authorization', `Bearer ${writeToken}`)
        .send({ userId: otherUser.id, encryptedSecretsKey: 'encryptedSecretsKey' });

      // then
      expect(response.status).toEqual(403);
    });

    it('does not add encrypted secrets key when not logged in', async () => {
      // given
      const { project } = await bootstrap.utils.projectUtils.setupOwner();

      // when
      const response = await request(bootstrap.app.getHttpServer()).post(
        `/projects/${project.id}/encrypted-secrets-keys`,
      );

      // then
      expect(response.status).toEqual(401);
    });
  });

  describe('Projects Order', () => {
    it('adds project to projectsOrder when creating project', async () => {
      // given
      const { user, token } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });

      // when
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

      // then
      const userFromDb = await bootstrap.models.userModel.findById(user.id).lean();
      expect(userFromDb?.projectsOrder).toEqual([project1.id, project2.id]);
    });

    it('returns projects in correct order based on projectsOrder', async () => {
      // given
      const { token } = await bootstrap.utils.userUtils.createDefault({
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

      const project3 = await bootstrap.utils.projectUtils.createProject(token, {
        name: 'project-3',
        encryptedSecrets: '',
        encryptedSecretsKeys: {},
      });

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .get('/users/me/projects')
        .set('authorization', `Bearer ${token}`);

      // then
      expect(response.status).toEqual(200);
      expect(response.body.map((p: any) => p.id)).toEqual([project1.id, project2.id, project3.id]);
    });

    it('adds project to projectsOrder when accepting link invitation', async () => {
      // given
      const { token: ownerToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'owner@test.com',
      });
      const { user: invitedUser, token: invitedToken } =
        await bootstrap.utils.userUtils.createDefault({
          email: 'invited@test.com',
        });

      const project = await bootstrap.utils.projectUtils.createProject(ownerToken);

      const invitation = await bootstrap.utils.invitationUtils.createInvitation(
        ownerToken,
        project.id,
        { role: Role.Read },
      );

      // when
      await request(bootstrap.app.getHttpServer())
        .post(`/invitations/${invitation.id}/accept`)
        .set('authorization', `Bearer ${invitedToken}`)
        .send({ newSecretsKey: 'encryptedKey' });

      // then
      const userFromDb = await bootstrap.models.userModel.findById(invitedUser.id).lean();
      expect(userFromDb?.projectsOrder).toContain(project.id);
    });

    it('adds project to projectsOrder when accepting personal invitation', async () => {
      // given
      const { token: ownerToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'owner@test.com',
      });
      const { user: invitedUser, token: invitedToken } =
        await bootstrap.utils.userUtils.createDefault({
          email: 'invited@test.com',
        });

      const project = await bootstrap.utils.projectUtils.createProject(ownerToken);
      const invitation = await bootstrap.utils.personalInvitationUtils.createPersonalInvitation(
        ownerToken,
        invitedUser.id,
        project.id,
        { role: Role.Read },
      );

      // when
      await request(bootstrap.app.getHttpServer())
        .post(`/personal-invitations/${invitation.id}/accept`)
        .set('authorization', `Bearer ${invitedToken}`);

      // then
      const userFromDb = await bootstrap.models.userModel.findById(invitedUser.id).lean();
      expect(userFromDb?.projectsOrder).toContain(project.id);
    });

    it('removes project from projectsOrder when leaving project', async () => {
      // given
      const { user, token } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });

      const project = await bootstrap.utils.projectUtils.createProject(token, {
        name: 'project-1',
        encryptedSecrets: '',
        encryptedSecretsKeys: {},
      });

      // when
      await request(bootstrap.app.getHttpServer())
        .delete(`/projects/${project.id}/members/${user.id}`)
        .set('authorization', `Bearer ${token}`);

      // then
      const userFromDb = await bootstrap.models.userModel.findById(user.id).lean();
      expect(userFromDb?.projectsOrder).not.toContain(project.id);
    });

    it('removes project from projectsOrder when kicked from project', async () => {
      // given
      const { token: ownerToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'owner@test.com',
      });
      const { user: member, token: memberToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'member@test.com',
      });

      const project = await bootstrap.utils.projectUtils.createProject(ownerToken);
      const invitation = await bootstrap.utils.invitationUtils.createInvitation(
        ownerToken,
        project.id,
        { role: Role.Read },
      );

      await request(bootstrap.app.getHttpServer())
        .post(`/invitations/${invitation.id}/accept`)
        .set('authorization', `Bearer ${memberToken}`)
        .send({ newSecretsKey: 'encryptedKey' });

      // when
      await request(bootstrap.app.getHttpServer())
        .delete(`/projects/${project.id}/members/${member.id}`)
        .set('authorization', `Bearer ${ownerToken}`);

      // then
      const userFromDb = await bootstrap.models.userModel.findById(member.id).lean();
      expect(userFromDb?.projectsOrder).not.toContain(project.id);
    });
  });
});
