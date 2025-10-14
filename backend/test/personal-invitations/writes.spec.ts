import * as request from 'supertest';
import { Role } from '../../src/shared/types/role.enum';
import { createTestApp } from '../utils/bootstrap';

describe('PersonalInvitationCoreController (writes)', () => {
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

  describe('POST /personal-invitations', () => {
    it('creates personal invitation with read role when admin', async () => {
      const { user: admin, token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: invitee } = await bootstrap.utils.userUtils.createDefault({
        email: 'invitee@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);

      const response = await request(bootstrap.app.getHttpServer())
        .post(`/projects/${project.id}/personal-invitations`)
        .set('authorization', `Bearer ${adminToken}`)
        .send({
          invitedUserId: invitee.id,
          role: Role.Read,
        });

      expect(response.status).toEqual(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        projectId: project.id,
        author: {
          id: admin.id,
          email: admin.email,
          avatarUrl: admin.avatarUrl,
        },
        invitedUser: {
          id: invitee.id,
          email: invitee.email,
          avatarUrl: invitee.avatarUrl,
        },
        role: Role.Read,
        createdAt: expect.any(String),
      });
    });

    it('creates personal invitation with write role when admin', async () => {
      const { user: admin, token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: invitee } = await bootstrap.utils.userUtils.createDefault({
        email: 'invitee@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);

      const response = await request(bootstrap.app.getHttpServer())
        .post(`/projects/${project.id}/personal-invitations`)
        .set('authorization', `Bearer ${adminToken}`)
        .send({
          invitedUserId: invitee.id,
          role: Role.Write,
        });

      expect(response.status).toEqual(201);
      expect(response.body.role).toEqual(Role.Write);
    });

    it('creates personal invitation with admin role when admin', async () => {
      const { user: admin, token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: invitee } = await bootstrap.utils.userUtils.createDefault({
        email: 'invitee@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);

      const response = await request(bootstrap.app.getHttpServer())
        .post(`/projects/${project.id}/personal-invitations`)
        .set('authorization', `Bearer ${adminToken}`)
        .send({
          invitedUserId: invitee.id,
          role: Role.Admin,
        });

      expect(response.status).toEqual(201);
      expect(response.body.role).toEqual(Role.Admin);
    });

    it('does not create invitation when not project member', async () => {
      const { token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { token: otherToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'other@test.com',
      });
      const { user: invitee } = await bootstrap.utils.userUtils.createDefault({
        email: 'invitee@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);

      const response = await request(bootstrap.app.getHttpServer())
        .post(`/projects/${project.id}/personal-invitations`)
        .set('authorization', `Bearer ${otherToken}`)
        .send({
          invitedUserId: invitee.id,
          role: Role.Read,
        });

      expect(response.status).toEqual(403);
    });

    it('does not create invitation when write member', async () => {
      const { token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: writeUser, token: writeToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'write@test.com',
      });
      const { user: invitee } = await bootstrap.utils.userUtils.createDefault({
        email: 'invitee@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);
      await bootstrap.utils.projectUtils.addMemberToProject(project.id, writeUser.id, Role.Write);

      const response = await request(bootstrap.app.getHttpServer())
        .post(`/projects/${project.id}/personal-invitations`)
        .set('authorization', `Bearer ${writeToken}`)
        .send({
          invitedUserId: invitee.id,
          role: Role.Read,
        });

      expect(response.status).toEqual(403);
    });

    it('does not create invitation when read member', async () => {
      const { token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: readUser, token: readToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'read@test.com',
      });
      const { user: invitee } = await bootstrap.utils.userUtils.createDefault({
        email: 'invitee@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);
      await bootstrap.utils.projectUtils.addMemberToProject(project.id, readUser.id, Role.Read);

      const response = await request(bootstrap.app.getHttpServer())
        .post(`/projects/${project.id}/personal-invitations`)
        .set('authorization', `Bearer ${readToken}`)
        .send({
          invitedUserId: invitee.id,
          role: Role.Read,
        });
    });

    it('does not create when not logged in', async () => {
      const { token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: invitee } = await bootstrap.utils.userUtils.createDefault({
        email: 'invitee@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);

      const response = await request(bootstrap.app.getHttpServer())
        .post(`/projects/${project.id}/personal-invitations`)
        .send({
          invitedUserId: invitee.id,
          role: Role.Read,
        });

      expect(response.status).toEqual(401);
    });
  });

  describe('POST /personal-invitations/:id/accept', () => {
    it('accepts invitation and adds user to project as read', async () => {
      const { token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: invitee, token: inviteeToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'invitee@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);
      const invitation = await bootstrap.utils.personalInvitationUtils.createPersonalInvitation(
        adminToken,
        invitee.id,
        project.id,
      );

      const response = await request(bootstrap.app.getHttpServer())
        .post(`/personal-invitations/${invitation.id}/accept`)
        .set('authorization', `Bearer ${inviteeToken}`)
        .send();

      expect(response.status).toEqual(201);

      const updatedProject = await bootstrap.utils.projectUtils.getProject(
        project.id,
        inviteeToken,
      );

      expect(updatedProject.members).toContainEqual({
        id: invitee.id,
        email: invitee.email,
        avatarUrl: invitee.avatarUrl,
        role: Role.Read,
      });
    });

    it('accepts invitation and adds user to project as write', async () => {
      const { token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: invitee, token: inviteeToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'invitee@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);
      const invitation = await bootstrap.utils.personalInvitationUtils.createPersonalInvitation(
        adminToken,
        invitee.id,
        project.id,
        { role: Role.Write },
      );

      const response = await request(bootstrap.app.getHttpServer())
        .post(`/personal-invitations/${invitation.id}/accept`)
        .set('authorization', `Bearer ${inviteeToken}`)
        .send();

      expect(response.status).toEqual(201);

      const updatedProject = await bootstrap.utils.projectUtils.getProject(
        project.id,
        inviteeToken,
      );

      expect(updatedProject.members).toContainEqual({
        id: invitee.id,
        email: invitee.email,
        avatarUrl: invitee.avatarUrl,
        role: Role.Write,
      });
    });

    it('does not accept invitation when not the invited user', async () => {
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
      const invitation = await bootstrap.utils.personalInvitationUtils.createPersonalInvitation(
        adminToken,
        invitee.id,
        project.id,
      );

      const response = await request(bootstrap.app.getHttpServer())
        .post(`/personal-invitations/${invitation.id}/accept`)
        .set('authorization', `Bearer ${otherToken}`)
        .send();

      expect(response.status).toEqual(403);
    });

    it('does not accept invitation twice', async () => {
      const { token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: invitee, token: inviteeToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'invitee@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);
      const invitation = await bootstrap.utils.personalInvitationUtils.createPersonalInvitation(
        adminToken,
        invitee.id,
        project.id,
      );
      await request(bootstrap.app.getHttpServer())
        .post(`/personal-invitations/${invitation.id}/accept`)
        .set('authorization', `Bearer ${inviteeToken}`)
        .send();

      const response = await request(bootstrap.app.getHttpServer())
        .post(`/personal-invitations/${invitation.id}/accept`)
        .set('authorization', `Bearer ${inviteeToken}`)
        .send();

      expect(response.status).toEqual(404);
    });

    it('does not accept when not logged in', async () => {
      const { token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: invitee } = await bootstrap.utils.userUtils.createDefault({
        email: 'invitee@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);
      const invitation = await bootstrap.utils.personalInvitationUtils.createPersonalInvitation(
        adminToken,
        invitee.id,
        project.id,
      );

      const response = await request(bootstrap.app.getHttpServer())
        .post(`/personal-invitations/${invitation.id}/accept`)
        .send();

      expect(response.status).toEqual(401);
    });

    it('returns 404 if invitation not found', async () => {
      const { token } = await bootstrap.utils.userUtils.createDefault();

      const response = await request(bootstrap.app.getHttpServer())
        .post(`/personal-invitations/60f7eabc1234567890abcdef/accept`)
        .set('authorization', `Bearer ${token}`)
        .send();

      expect(response.status).toEqual(404);
    });
  });

  describe('DELETE /personal-invitations/:id', () => {
    it('revokes invitation when project admin', async () => {
      const { token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: invitee } = await bootstrap.utils.userUtils.createDefault({
        email: 'invitee@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);
      const invitation = await bootstrap.utils.personalInvitationUtils.createPersonalInvitation(
        adminToken,
        invitee.id,
        project.id,
      );
      const response = await request(bootstrap.app.getHttpServer())
        .delete(`/personal-invitations/${invitation.id}`)
        .set('authorization', `Bearer ${adminToken}`);

      const updatedInvitation = await bootstrap.models.personalInvitationModel.findOne({
        _id: invitation.id,
      });

      expect(response.status).toEqual(204);
      expect(updatedInvitation).toBeNull();
    });

    it('removes only invited user encrypted secrets key and keeps others', async () => {
      const { user: admin, token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: invitee } = await bootstrap.utils.userUtils.createDefault({
        email: 'invitee@test.com',
      });
      const { user: otherMember } = await bootstrap.utils.userUtils.createDefault({
        email: 'other@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken, {
        name: 'test-project',
        encryptedSecretsKeys: {
          [admin.id]: 'admin-key',
          [invitee.id]: 'invitee-key',
          [otherMember.id]: 'other-key',
        },
        encryptedSecrets: '',
      });
      await bootstrap.utils.projectUtils.addMemberToProject(project.id, otherMember.id, Role.Read);
      const invitation = await bootstrap.utils.personalInvitationUtils.createPersonalInvitation(
        adminToken,
        invitee.id,
        project.id,
      );

      await request(bootstrap.app.getHttpServer())
        .delete(`/personal-invitations/${invitation.id}`)
        .set('authorization', `Bearer ${adminToken}`);

      const updatedProject = await bootstrap.models.projectModel.findById(project.id);

      const encryptedSecretsKeysObject = Object.fromEntries(
        updatedProject?.encryptedSecretsKeys as any,
      );

      expect(encryptedSecretsKeysObject).toEqual({
        [admin.id]: 'admin-key',
        [otherMember.id]: 'other-key',
      });
    });

    it('does not revoke invitation when not project member', async () => {
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
      const invitation = await bootstrap.utils.personalInvitationUtils.createPersonalInvitation(
        adminToken,
        invitee.id,
        project.id,
      );

      const response = await request(bootstrap.app.getHttpServer())
        .delete(`/personal-invitations/${invitation.id}`)
        .set('authorization', `Bearer ${otherToken}`);

      expect(response.status).toEqual(403);
    });

    it('does not revoke when read/write but not admin', async () => {
      const { token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: writeUser, token: writeToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'write@test.com',
      });
      const { user: invitee } = await bootstrap.utils.userUtils.createDefault({
        email: 'invitee@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);
      await bootstrap.utils.projectUtils.addMemberToProject(project.id, writeUser.id, Role.Write);
      const invitation = await bootstrap.utils.personalInvitationUtils.createPersonalInvitation(
        adminToken,
        invitee.id,
        project.id,
      );

      const response = await request(bootstrap.app.getHttpServer())
        .delete(`/personal-invitations/${invitation.id}`)
        .set('authorization', `Bearer ${writeToken}`);

      expect(response.status).toEqual(403);
    });

    it('does not revoke when not logged in', async () => {
      const { token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: invitee } = await bootstrap.utils.userUtils.createDefault({
        email: 'invitee@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);
      const invitation = await bootstrap.utils.personalInvitationUtils.createPersonalInvitation(
        adminToken,
        invitee.id,
        project.id,
      );

      const response = await request(bootstrap.app.getHttpServer()).delete(
        `/personal-invitations/${invitation.id}`,
      );

      expect(response.status).toEqual(401);
    });
  });

  describe('POST /personal-invitations/:id/reject', () => {
    it('rejects invitation when invited user', async () => {
      const { token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: invitee, token: inviteeToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'invitee@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);
      const invitation = await bootstrap.utils.personalInvitationUtils.createPersonalInvitation(
        adminToken,
        invitee.id,
        project.id,
      );

      const response = await request(bootstrap.app.getHttpServer())
        .post(`/personal-invitations/${invitation.id}/reject`)
        .set('authorization', `Bearer ${inviteeToken}`);

      const updatedInvitation = await bootstrap.models.personalInvitationModel.findOne({
        _id: invitation.id,
      });

      expect(response.status).toEqual(204);
      expect(updatedInvitation).toBeNull();
    });

    it('removes encrypted secrets key when rejecting invitation', async () => {
      const { user: admin, token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: invitee, token: inviteeToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'invitee@test.com',
      });
      const { user: otherMember } = await bootstrap.utils.userUtils.createDefault({
        email: 'other@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken, {
        name: 'test-project',
        encryptedSecretsKeys: {
          [admin.id]: 'admin-key',
          [invitee.id]: 'invitee-key',
          [otherMember.id]: 'other-key',
        },
        encryptedSecrets: '',
      });
      await bootstrap.utils.projectUtils.addMemberToProject(project.id, otherMember.id, Role.Read);
      const invitation = await bootstrap.utils.personalInvitationUtils.createPersonalInvitation(
        adminToken,
        invitee.id,
        project.id,
      );

      await request(bootstrap.app.getHttpServer())
        .post(`/personal-invitations/${invitation.id}/reject`)
        .set('authorization', `Bearer ${inviteeToken}`);

      const updatedProject = await bootstrap.models.projectModel.findById(project.id);
      const encryptedSecretsKeysObject = Object.fromEntries(
        updatedProject?.encryptedSecretsKeys as any,
      );

      expect(encryptedSecretsKeysObject).toEqual({
        [admin.id]: 'admin-key',
        [otherMember.id]: 'other-key',
      });
    });

    it('does not reject invitation when not the invited user', async () => {
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
      const invitation = await bootstrap.utils.personalInvitationUtils.createPersonalInvitation(
        adminToken,
        invitee.id,
        project.id,
      );

      const response = await request(bootstrap.app.getHttpServer())
        .post(`/personal-invitations/${invitation.id}/reject`)
        .set('authorization', `Bearer ${otherToken}`);

      expect(response.status).toEqual(403);
    });

    it('does not reject when not logged in', async () => {
      const { token: adminToken } = await bootstrap.utils.userUtils.createDefault({
        email: 'admin@test.com',
      });
      const { user: invitee } = await bootstrap.utils.userUtils.createDefault({
        email: 'invitee@test.com',
      });
      const project = await bootstrap.utils.projectUtils.createProject(adminToken);
      const invitation = await bootstrap.utils.personalInvitationUtils.createPersonalInvitation(
        adminToken,
        invitee.id,
        project.id,
      );

      const response = await request(bootstrap.app.getHttpServer()).post(
        `/personal-invitations/${invitation.id}/reject`,
      );

      expect(response.status).toEqual(401);
    });

    it('returns 404 if invitation not found', async () => {
      const { token } = await bootstrap.utils.userUtils.createDefault();

      const response = await request(bootstrap.app.getHttpServer())
        .post(`/personal-invitations/60f7eabc1234567890abcdef/reject`)
        .set('authorization', `Bearer ${token}`)
        .send();

      expect(response.status).toEqual(404);
    });
  });
});
