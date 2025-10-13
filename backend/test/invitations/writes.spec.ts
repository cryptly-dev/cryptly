import * as request from 'supertest';
import { Role } from '../../src/shared/types/role.enum';
import { createTestApp } from '../utils/bootstrap';

describe('InvitationCoreController (writes)', () => {
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

  describe('POST /invitations', () => {
    it('creates write invitation when admin', async () => {
      // given
      const { user: admin, token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: invitee } = await bootstrap.utils.userUtils.createDefault({
        email: 'invitee@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .post('/invitations')
        .set('authorization', `Bearer ${adminToken}`)
        .send({
          projectId: project.id,
          temporaryPublicKey: 'test-public-key',
          temporaryPrivateKey: 'test-private-key',
          temporarySecretsKey: 'test-secrets-key',
          role: Role.Write,
        });

      // then
      expect(response.status).toEqual(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        projectId: project.id,
        author: {
          id: admin.id,
          email: admin.email,
          avatarUrl: admin.avatarUrl,
        },
        role: Role.Write,
        temporaryPublicKey: 'test-public-key',
        temporaryPrivateKey: 'test-private-key',
        temporarySecretsKey: 'test-secrets-key',
        createdAt: expect.any(String),
      });
    });

    it('creates read invitation when admin', async () => {
      // given
      const {
        user: admin,
        token: adminToken,
        project,
      } = await bootstrap.utils.projectUtils.setupAdmin();

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .post('/invitations')
        .set('authorization', `Bearer ${adminToken}`)
        .send({
          projectId: project.id,
          temporaryPublicKey: 'test-public-key',
          temporaryPrivateKey: 'test-private-key',
          temporarySecretsKey: 'test-secrets-key',
          role: Role.Read,
        });

      // then
      expect(response.status).toEqual(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        projectId: project.id,
        author: {
          id: admin.id,
          email: admin.email,
          avatarUrl: admin.avatarUrl,
        },
        role: Role.Read,
        temporaryPublicKey: 'test-public-key',
        temporaryPrivateKey: 'test-private-key',
        temporarySecretsKey: 'test-secrets-key',
        createdAt: expect.any(String),
      });
    });

    it('creates admin invitation when admin', async () => {
      // given
      const {
        user: admin,
        token: adminToken,
        project,
      } = await bootstrap.utils.projectUtils.setupAdmin();

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .post('/invitations')
        .set('authorization', `Bearer ${adminToken}`)
        .send({
          projectId: project.id,
          temporaryPublicKey: 'test-public-key',
          temporaryPrivateKey: 'test-private-key',
          temporarySecretsKey: 'test-secrets-key',
          role: Role.Admin,
        });

      // then
      expect(response.status).toEqual(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        projectId: project.id,
        author: {
          id: admin.id,
          email: admin.email,
          avatarUrl: admin.avatarUrl,
        },
        role: Role.Admin,
        temporaryPublicKey: 'test-public-key',
        temporaryPrivateKey: 'test-private-key',
        temporarySecretsKey: 'test-secrets-key',
        createdAt: expect.any(String),
      });
    });

    it('does not create invitation when not project member', async () => {
      // given
      const { token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { token: otherToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'other@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .post('/invitations')
        .set('authorization', `Bearer ${otherToken}`)
        .send({
          projectId: project.id,
          temporaryPublicKey: 'test-public-key',
          temporaryPrivateKey: 'test-private-key',
          temporarySecretsKey: 'test-secrets-key',
        });

      // then
      expect(response.status).toEqual(403);
    });

    it('does not create invitation when read/write member', async () => {
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
        .post('/invitations')
        .set('authorization', `Bearer ${writeToken}`)
        .send({
          projectId: project.id,
          temporaryPublicKey: 'test-public-key',
          temporaryPrivateKey: 'test-private-key',
          temporarySecretsKey: 'test-secrets-key',
        });

      // then
      expect(response.status).toEqual(403);
    });

    it('does not create when not logged in', async () => {
      // given
      const { token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: invitee } = await bootstrap.utils.userUtils.createDefault({
        email: 'invitee@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);

      // when
      const response = await request(bootstrap.app.getHttpServer()).post('/invitations').send({
        projectId: project.id,
        temporaryPublicKey: 'test-public-key',
        temporaryPrivateKey: 'test-private-key',
        temporarySecretsKey: 'test-secrets-key',
      });

      // then
      expect(response.status).toEqual(401);
    });
  });

  describe('POST /invitations/:id/accept', () => {
    it('accepts invitation and adds user to project as read', async () => {
      // given
      const { token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: invitee, token: inviteeToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'invitee@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);
      const invitation = await bootstrap.utils.invitationUtils.createInvitation(
        adminToken,
        project.id,
      );

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .post(`/invitations/${invitation.id}/accept`)
        .set('authorization', `Bearer ${inviteeToken}`)
        .send({ newSecretsKey: 'passphrase' });

      // then
      expect(response.status).toEqual(201);

      const updatedProject = await bootstrap.utils.projectUtils.getProject(
        project.id,
        inviteeToken,
      );

      expect(updatedProject.members).toContainEqual({
        id: invitee.id,
        email: invitee.email,
        avatarUrl: invitee.avatarUrl,
        role: 'read',
      });
    });

    it('accepts invitation and adds user to project as write', async () => {
      // given
      const { token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: invitee, token: inviteeToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'invitee@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);
      const invitation = await bootstrap.utils.invitationUtils.createInvitation(
        adminToken,
        project.id,
        { role: Role.Write },
      );

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .post(`/invitations/${invitation.id}/accept`)
        .set('authorization', `Bearer ${inviteeToken}`)
        .send({ newSecretsKey: 'passphrase' });

      // then
      expect(response.status).toEqual(201);

      const updatedProject = await bootstrap.utils.projectUtils.getProject(
        project.id,
        inviteeToken,
      );

      expect(updatedProject.members).toContainEqual({
        id: invitee.id,
        email: invitee.email,
        avatarUrl: invitee.avatarUrl,
        role: 'write',
      });
    });

    it('can read secrets after adding member', async () => {
      // given
      const { user: admin, token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: invitee, token: inviteeToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'invitee@test.com',
      });

      const project = await bootstrap.utils.projectUtils.createProject(adminToken, {
        encryptedSecrets: 'passphrase',
        encryptedSecretsKeys: { [admin.id]: 'admin-passphrase' },
        name: 'test-project',
      });
      const invitation = await bootstrap.utils.invitationUtils.createInvitation(
        adminToken,
        project.id,
      );

      // when
      await request(bootstrap.app.getHttpServer())
        .post(`/invitations/${invitation.id}/accept`)
        .set('authorization', `Bearer ${inviteeToken}`)
        .send({ newSecretsKey: 'invitee-passphrase' });
      const response = await request(bootstrap.app.getHttpServer())
        .get(`/projects/${project.id}`)
        .set('authorization', `Bearer ${adminToken}`);

      // then
      expect(response.status).toEqual(200);
      expect(response.body).toMatchObject({
        encryptedSecrets: 'passphrase',
        encryptedSecretsKeys: {
          [admin.id]: 'admin-passphrase',
          [invitee.id]: 'invitee-passphrase',
        },
      });
    });

    it('does not accept invitation twice', async () => {
      // given
      const { token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { token: inviteeToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'invitee@test.com',
      });
      const { token: otherInviteeToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'other-invitee@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);
      const invitation = await bootstrap.utils.invitationUtils.createInvitation(
        adminToken,
        project.id,
      );
      await request(bootstrap.app.getHttpServer())
        .post(`/invitations/${invitation.id}/accept`)
        .set('authorization', `Bearer ${inviteeToken}`)
        .send({ newSecretsKey: 'encryptedSecretsKey' });

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .post(`/invitations/${invitation.id}/accept`)
        .set('authorization', `Bearer ${otherInviteeToken}`)
        .send({ newSecretsKey: 'encryptedSecretsKey' });

      // then
      expect(response.status).toEqual(404);
    });

    it('does not accept when not logged in', async () => {
      // given
      const { token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: invitee } = await bootstrap.utils.userUtils.createDefault({
        email: 'invitee@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);
      const invitation = await bootstrap.utils.invitationUtils.createInvitation(
        adminToken,
        project.id,
      );

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .post(`/invitations/${invitation.id}/accept`)
        .send({ newSecretsKey: 'encryptedSecretsKey' });

      // then
      expect(response.status).toEqual(401);
    });

    it('returns 404 if invitation not found', async () => {
      // given
      const { token } = await bootstrap.utils.userUtils.createDefault();

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .post(`/invitations/60f7eabc1234567890abcdef/accept`)
        .set('authorization', `Bearer ${token}`)
        .send({ newSecretsKey: 'encryptedSecretsKey' });

      // then
      expect(response.status).toEqual(404);
    });
  });

  describe('DELETE /invitations/:id', () => {
    it('revokes invitation when project admin', async () => {
      // given
      const { token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { token: inviteeToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'invitee@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);
      const invitation = await bootstrap.utils.invitationUtils.createInvitation(
        adminToken,
        project.id,
      );
      await request(bootstrap.app.getHttpServer())
        .delete(`/invitations/${invitation.id}`)
        .set('authorization', `Bearer ${adminToken}`);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .delete(`/invitations/${invitation.id}`)
        .set('authorization', `Bearer ${inviteeToken}`);

      // then
      expect(response.status).toEqual(404);
    });

    it('revokes invitation when another admin', async () => {
      // given
      const { token: adminAToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'adminA@test.com',
      });
      const { user: adminB, token: adminBToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'adminB@test.com',
      });
      const { token: inviteeToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'invitee@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminAToken);
      await bootstrap.utils.projectUtils.addMemberToProject(project.id, adminB.id, Role.Admin);
      const invitation = await bootstrap.utils.invitationUtils.createInvitation(
        adminAToken,
        project.id,
      );
      await request(bootstrap.app.getHttpServer())
        .delete(`/invitations/${invitation.id}`)
        .set('authorization', `Bearer ${adminBToken}`);

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .delete(`/invitations/${invitation.id}`)
        .set('authorization', `Bearer ${inviteeToken}`);

      // then
      expect(response.status).toEqual(404);
    });

    it('does not revoke invitation when not project member', async () => {
      // given
      const { token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: invitee } = await bootstrap.utils.userUtils.createDefault({
        email: 'invitee@test.com',
      });
      const { token: otherToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'other@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);
      const invitation = await bootstrap.utils.invitationUtils.createInvitation(
        adminToken,
        project.id,
      );

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .delete(`/invitations/${invitation.id}`)
        .set('authorization', `Bearer ${otherToken}`);

      // then
      expect(response.status).toEqual(403);
    });

    it('does not revoke when read/write but not admin', async () => {
      // given
      const { token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: writeUser, token: writeToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'write@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);
      await bootstrap.utils.projectUtils.addMemberToProject(project.id, writeUser.id, Role.Write);
      const invitation = await bootstrap.utils.invitationUtils.createInvitation(
        adminToken,
        project.id,
      );

      // when
      const response = await request(bootstrap.app.getHttpServer())
        .delete(`/invitations/${invitation.id}`)
        .set('authorization', `Bearer ${writeToken}`);

      // then
      expect(response.status).toEqual(403);
    });

    it('does not revoke when not logged in', async () => {
      // given
      const { token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: invitee } = await bootstrap.utils.userUtils.createDefault({
        email: 'invitee@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);
      const invitation = await bootstrap.utils.invitationUtils.createInvitation(
        adminToken,
        project.id,
      );

      // when
      const response = await request(bootstrap.app.getHttpServer()).delete(
        `/invitations/${invitation.id}`,
      );

      // then
      expect(response.status).toEqual(401);
    });
  });
});
