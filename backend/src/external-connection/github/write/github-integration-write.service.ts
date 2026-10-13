import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GithubIntegrationEntity } from '../core/entities/github-integration.entity';
import { GithubIntegrationNormalized } from '../core/entities/github-integration.interface';
import { GithubIntegrationSerializer } from '../core/entities/github-integration.serializer';
import { CreateGithubIntegrationDto } from './dto/create-github-integration.dto';

@Injectable()
export class GithubIntegrationWriteService {
  constructor(
    @InjectModel(GithubIntegrationEntity.name)
    private githubIntegrationModel: Model<GithubIntegrationEntity>,
  ) {}

  public async create(dto: CreateGithubIntegrationDto): Promise<GithubIntegrationNormalized> {
    const integration = await this.githubIntegrationModel.create({
      projectId: dto.projectId,
      githubRepositoryId: dto.githubRepositoryId,
      githubRepositoryPublicKey: dto.repositoryPublicKey,
      githubRepositoryPublicKeyId: dto.repositoryPublicKeyId,
      installationEntityId: dto.installationEntityId,
    });

    return GithubIntegrationSerializer.normalize(integration);
  }

  /** Only touches integrations of `projectId`, so ids from other projects are ignored. */
  public async markPushed(projectId: string, integrationIds: string[], at: Date): Promise<void> {
    await this.githubIntegrationModel.updateMany(
      {
        _id: { $in: integrationIds.map((id) => new Types.ObjectId(id)) },
        projectId: new Types.ObjectId(projectId),
      },
      { $set: { lastPushedAt: at } },
    );
  }

  public async deleteById(integrationId: string): Promise<void> {
    await this.githubIntegrationModel.deleteOne({ _id: new Types.ObjectId(integrationId) });
  }

  // todo: very important
  public async deleteByProjectId(cryptlyProjectId: string): Promise<void> {
    await this.githubIntegrationModel.deleteMany({ projectId: cryptlyProjectId });
  }

  public async deleteByInstallationEntityId(installationEntityId: string): Promise<void> {
    await this.githubIntegrationModel.deleteMany({ installationEntityId });
  }
}
