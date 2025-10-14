import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CreatePersonalInvitationBody } from '../../src/personal-invitation/core/dto/create-personal-invitation.body';
import { PersonalInvitationSerialized } from '../../src/personal-invitation/core/entities/personal-invitation.interface';
import { Role } from '../../src/shared/types/role.enum';

export class PersonalInvitationUtils {
  constructor(private readonly app: INestApplication) {}

  public async createPersonalInvitation(
    token: string,
    invitedUserId: string,
    projectId: string,
    data: Partial<CreatePersonalInvitationBody> = {},
  ): Promise<PersonalInvitationSerialized> {
    const response = await request(this.app.getHttpServer())
      .post(`/projects/${projectId}/personal-invitations`)
      .set('authorization', `Bearer ${token}`)
      .send({
        role: Role.Read,
        ...data,
        invitedUserId,
      });

    return response.body;
  }
}
