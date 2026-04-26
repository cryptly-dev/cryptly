import { Injectable } from '@nestjs/common';
import { getEnvConfig } from '../../../shared/config/env-config';
import { GithubRepository } from './dto/github-repository.dto';
import { GithubInstallationLiveData } from './dto/github-installation.dto';
import {
  isLocalGithubMockInstallationId,
  LOCAL_GITHUB_MOCK_REPOSITORIES,
  LOCAL_GITHUB_MOCK_REPOSITORY_KEY_ID,
  LOCAL_GITHUB_MOCK_REPOSITORY_PUBLIC_KEY,
} from './local-github-mock.constants';
import { GithubApiFacadeService, GithubApiRepository } from './github-api-facade.service';

export type GithubRepositoryKey = {
  keyId: string;
  key: string;
};

export type AccessTokenResponseDto = {
  token: string;
  expiresAt: string;
};

@Injectable()
export class GithubExternalConnectionClientService {
  constructor(private readonly githubApiFacadeService: GithubApiFacadeService) {}

  private get isLocalGithubMock(): boolean {
    return getEnvConfig().githubLocalMock;
  }

  public async getRepositoriesAvailableForInstallation(
    installationId: number,
  ): Promise<GithubRepository[]> {
    if (this.isLocalGithubMock && isLocalGithubMockInstallationId(installationId)) {
      return [...LOCAL_GITHUB_MOCK_REPOSITORIES];
    }

    const repositories =
      await this.githubApiFacadeService.getInstallationRepositories(installationId);

    return repositories.map((repo) => this.mapGithubApiRepository(repo));
  }

  public async getInstallationByGithubInstallationId(
    installationId: number,
  ): Promise<GithubInstallationLiveData> {
    if (this.isLocalGithubMock && isLocalGithubMockInstallationId(installationId)) {
      return {
        id: installationId,
        avatar: 'https://avatars.githubusercontent.com/u/9919?s=64&v=4',
        owner: 'cryptly-local',
      };
    }

    const installation = await this.githubApiFacadeService.getInstallationById(installationId);

    const account = installation.account || { avatar_url: '', login: '' };

    return {
      id: installationId,
      avatar: account?.avatar_url || '',
      owner: 'login' in account ? account.login! : account?.name || '',
    };
  }

  public async deleteInstallation(installationId: number): Promise<void> {
    await this.githubApiFacadeService.deleteInstallation(installationId);
  }

  public async getRepositoryInfoByInstallationIdAndRepositoryId(params: {
    repositoryId: number;
    githubInstallationId: number;
  }): Promise<GithubRepository> {
    if (this.isLocalGithubMock && isLocalGithubMockInstallationId(params.githubInstallationId)) {
      const repo = LOCAL_GITHUB_MOCK_REPOSITORIES.find((r) => r.id === params.repositoryId);
      if (!repo) {
        throw new Error(`Local mock: unknown repository id ${params.repositoryId}`);
      }
      return { ...repo };
    }

    const repository = await this.githubApiFacadeService.getRepositoryById(params);

    return this.mapGithubApiRepository(repository);
  }

  public async getInstallationAccessToken(installationId: number): Promise<string> {
    if (this.isLocalGithubMock && isLocalGithubMockInstallationId(installationId)) {
      return 'local-github-mock-token';
    }

    const accessToken =
      await this.githubApiFacadeService.createInstallationAccessToken(installationId);

    return accessToken.token;
  }

  public async getRepositoryPublicKey(params: {
    owner: string;
    githubInstallationId: number;
    repositoryName: string;
  }): Promise<GithubRepositoryKey> {
    if (this.isLocalGithubMock && isLocalGithubMockInstallationId(params.githubInstallationId)) {
      return {
        keyId: LOCAL_GITHUB_MOCK_REPOSITORY_KEY_ID,
        key: LOCAL_GITHUB_MOCK_REPOSITORY_PUBLIC_KEY,
      };
    }

    const publicKey = await this.githubApiFacadeService.getRepositoryPublicKey(params);

    return {
      keyId: publicKey.key_id,
      key: publicKey.key,
    };
  }

  private mapGithubApiRepository(dto: GithubApiRepository): GithubRepository {
    return {
      id: dto.id,
      name: dto.name,
      owner: dto.owner.login,
      avatarUrl: dto.owner.avatar_url,
      url: dto.url,
      isPrivate: dto.private,
    };
  }
}
