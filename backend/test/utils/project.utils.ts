import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as request from 'supertest';
import { CreateProjectBody } from '../../src/project/core/dto/create-project.body';
import { ProjectEntity } from '../../src/project/core/entities/project.entity';
import { ProjectSerialized } from '../../src/project/core/entities/project.interface';
import { Role } from '../../src/shared/types/role.enum';
import { UserUtils } from './user.utils';

export class ProjectUtils {
  private readonly projectModel: Model<ProjectEntity>;

  constructor(
    private readonly app: INestApplication,
    private readonly userUtils: UserUtils,
  ) {
    this.projectModel = this.app.get<Model<ProjectEntity>>(getModelToken(ProjectEntity.name));
  }

  public async createProject(
    token: string,
    body: CreateProjectBody = {
      name: 'test-project',
      encryptedSecretsKeys: {},
      encryptedSecrets: '',
    },
  ): Promise<ProjectSerialized> {
    const response = await request(this.app.getHttpServer())
      .post('/projects')
      .set('authorization', `Bearer ${token}`)
      .send(body);

    return response.body;
  }

  public async addMemberToProject(
    projectId: string,
    memberId: string,
    role: Role = Role.Read,
  ): Promise<void> {
    await this.projectModel.updateOne(
      { _id: new Types.ObjectId(projectId) },
      { $set: { [`members.${memberId}`]: role } },
    );
  }

  public async getProject(projectId: string, token: string): Promise<ProjectSerialized> {
    const response = await request(this.app.getHttpServer())
      .get(`/projects/${projectId}`)
      .set('authorization', `Bearer ${token}`);

    return response.body;
  }

  public async setupOwner() {
    const { user, token } = await this.userUtils.createDefault();
    const project = await this.createProject(token);

    return { user, token, project };
  }

  public async setupAdmin() {
    const { user, token } = await this.userUtils.createDefault();
    const project = await this.createProject(token);

    return { user, token, project };
  }

  public async setupMember() {
    const { user: admin, token: adminToken } = await this.userUtils.createDefault({
      email: 'admin@test.com',
    });
    const { user: member, token: memberToken } = await this.userUtils.createDefault({
      email: 'member@test.com',
    });
    const project = await this.createProject(adminToken);
    await this.addMemberToProject(project.id, member.id, Role.Read);

    return { admin, member, token: memberToken, project };
  }

  public async setupRead() {
    const { user: admin, token: adminToken } = await this.userUtils.createDefault({
      email: 'admin@test.com',
    });
    const { user: read, token: readToken } = await this.userUtils.createDefault({
      email: 'read@test.com',
    });
    const project = await this.createProject(adminToken);
    await this.addMemberToProject(project.id, read.id, Role.Read);

    return { admin, read, token: readToken, project };
  }

  public async setupWrite() {
    const { user: admin, token: adminToken } = await this.userUtils.createDefault({
      email: 'admin@test.com',
    });
    const { user: write, token: writeToken } = await this.userUtils.createDefault({
      email: 'write@test.com',
    });
    const project = await this.createProject(adminToken);
    await this.addMemberToProject(project.id, write.id, Role.Write);

    return { admin, write, token: writeToken, project };
  }
}
