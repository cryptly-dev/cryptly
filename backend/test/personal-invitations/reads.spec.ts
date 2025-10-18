import * as request from 'supertest';
import { Role } from '../../src/shared/types/role.enum';
import { createTestApp } from '../utils/bootstrap';

describe('PersonalInvitationCoreController (reads)', () => {
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

  describe('GET /projects/:projectId/personal-invitations', () => {
    it('gets personal invitations for project as admin', async () => {
      const { user, token, project } = await bootstrap.utils.projectUtils.setupAdmin();
      const { user: invitedUser } = await bootstrap.utils.userUtils.createDefault({
        email: 'invited@test.com',
      });
      const invitationA = await bootstrap.utils.personalInvitationUtils.createPersonalInvitation(
        token,
        invitedUser.id,
        project.id,
      );
      const invitationB = await bootstrap.utils.personalInvitationUtils.createPersonalInvitation(
        token,
        invitedUser.id,
        project.id,
      );

      const response = await request(bootstrap.app.getHttpServer())
        .get(`/projects/${project.id}/personal-invitations`)
        .set('authorization', `Bearer ${token}`);

      expect(response.status).toEqual(200);
      expect(response.body).toHaveLength(2);
      expect(response.body.map((i) => i.id).sort()).toEqual(
        [invitationA.id, invitationB.id].sort(),
      );
      expect(response.body[0].author).toEqual({
        id: user.id,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      });
      expect(response.body[0].invitedUser).toEqual({
        id: invitedUser.id,
        displayName: invitedUser.displayName,
        avatarUrl: invitedUser.avatarUrl,
      });
    });

    it('returns empty array when no personal invitations', async () => {
      const { token, project } = await bootstrap.utils.projectUtils.setupAdmin();

      const response = await request(bootstrap.app.getHttpServer())
        .get(`/projects/${project.id}/personal-invitations`)
        .set('authorization', `Bearer ${token}`);

      expect(response.status).toEqual(200);
      expect(response.body).toEqual([]);
    });

    it('returns 403 when user is a read member', async () => {
      const { project, token: memberToken } = await bootstrap.utils.projectUtils.setupMember();

      const response = await request(bootstrap.app.getHttpServer())
        .get(`/projects/${project.id}/personal-invitations`)
        .set('authorization', `Bearer ${memberToken}`);

      expect(response.status).toEqual(403);
    });

    it('returns 403 when user is not a project member', async () => {
      const { project } = await bootstrap.utils.projectUtils.setupAdmin();
      const { token: tokenB } = await bootstrap.utils.userUtils.createDefault();

      const response = await request(bootstrap.app.getHttpServer())
        .get(`/projects/${project.id}/personal-invitations`)
        .set('authorization', `Bearer ${tokenB}`);

      expect(response.status).toEqual(403);
    });

    it('returns 401 when not logged in', async () => {
      const { project } = await bootstrap.utils.projectUtils.setupAdmin();

      const response = await request(bootstrap.app.getHttpServer()).get(
        `/projects/${project.id}/personal-invitations`,
      );

      expect(response.status).toEqual(401);
    });
  });

  describe('GET /users/me/personal-invitations', () => {
    it('gets my personal invitations as invited user', async () => {
      const { token: adminToken, project } = await bootstrap.utils.projectUtils.setupAdmin();
      const { user: invitedUser, token: invitedToken } =
        await bootstrap.utils.userUtils.createDefault({
          email: 'invited@test.com',
        });
      const invitation = await bootstrap.utils.personalInvitationUtils.createPersonalInvitation(
        adminToken,
        invitedUser.id,
        project.id,
      );

      const response = await request(bootstrap.app.getHttpServer())
        .get('/users/me/personal-invitations')
        .set('authorization', `Bearer ${invitedToken}`);

      expect(response.status).toEqual(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toEqual(invitation.id);
      expect(response.body[0].invitedUser.id).toEqual(invitedUser.id);
    });

    it('returns empty array when no invitations for user', async () => {
      const { token } = await bootstrap.utils.userUtils.createDefault();

      const response = await request(bootstrap.app.getHttpServer())
        .get('/users/me/personal-invitations')
        .set('authorization', `Bearer ${token}`);

      expect(response.status).toEqual(200);
      expect(response.body).toEqual([]);
    });

    it('returns 401 when not logged in', async () => {
      const response = await request(bootstrap.app.getHttpServer()).get(
        '/users/me/personal-invitations',
      );

      expect(response.status).toEqual(401);
    });
  });
});
