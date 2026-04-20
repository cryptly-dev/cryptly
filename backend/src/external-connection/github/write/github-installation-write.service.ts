import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { localGithubMockInstallationIdForUser } from '../client/local-github-mock.constants';
import { GithubInstallationEntity } from '../core/entities/github-installation.entity';
import { GithubInstallationNormalized } from '../core/entities/github-installation.interface';
import { GithubInstallationSerializer } from '../core/entities/github-installation.serializer';
import { CreateGithubInstallationDto } from './dto/create-github-installation.dto';

@Injectable()
export class GithubInstallationWriteService {
  constructor(
    @InjectModel(GithubInstallationEntity.name)
    private model: Model<GithubInstallationEntity>,
  ) {}

  public async create(dto: CreateGithubInstallationDto): Promise<GithubInstallationNormalized> {
    const installation = await this.model.create({
      githubInstallationId: dto.githubInstallationId,
      userId: dto.userId,
    });

    return GithubInstallationSerializer.normalize(installation);
  }

  public async deleteByGithubInstallationId(githubInstallationId: number): Promise<void> {
    await this.model.deleteOne({ githubInstallationId });
  }

  /** Ensures a synthetic GitHub App installation exists for local mock mode (per-user stable id). */
  public async ensureLocalMockInstallationForUser(userId: string): Promise<GithubInstallationNormalized> {
    const githubInstallationId = localGithubMockInstallationIdForUser(userId);
    let installation = await this.model
      .findOne({
        userId: new Types.ObjectId(userId),
        githubInstallationId,
      })
      .exec();

    if (!installation) {
      installation = await this.model.create({
        userId: new Types.ObjectId(userId),
        githubInstallationId,
      });
    }

    return GithubInstallationSerializer.normalize(installation);
  }
}
