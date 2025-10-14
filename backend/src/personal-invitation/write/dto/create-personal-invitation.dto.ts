import { Role } from '../../../shared/types/role.enum';

export class CreatePersonalInvitationDto {
  public projectId: string;
  public authorId: string;
  public invitedUserId: string;
  public role: Role;
}
