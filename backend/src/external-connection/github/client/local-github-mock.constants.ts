import { GithubRepository } from './dto/github-repository.dto';

/** Synthetic GitHub App installation ids for local mock fall in this inclusive range. */
export const LOCAL_GITHUB_MOCK_INSTALLATION_ID_MIN = 9_000_000;
export const LOCAL_GITHUB_MOCK_INSTALLATION_ID_MAX = 9_999_999;

export function isLocalGithubMockInstallationId(id: number): boolean {
  return id >= LOCAL_GITHUB_MOCK_INSTALLATION_ID_MIN && id <= LOCAL_GITHUB_MOCK_INSTALLATION_ID_MAX;
}

export function localGithubMockInstallationIdForUser(userId: string): number {
  let h = 0;
  for (let i = 0; i < userId.length; i++) {
    h = (h * 31 + userId.charCodeAt(i)) >>> 0;
  }
  const span = LOCAL_GITHUB_MOCK_INSTALLATION_ID_MAX - LOCAL_GITHUB_MOCK_INSTALLATION_ID_MIN + 1;
  return LOCAL_GITHUB_MOCK_INSTALLATION_ID_MIN + (h % span);
}

/**
 * Demo repositories returned for every user when local GitHub mock mode is on.
 * Public key matches frontend SodiumCrypto.encrypt (libsodium crypto_box seal).
 */
export const LOCAL_GITHUB_MOCK_REPOSITORY_PUBLIC_KEY =
  '4epbX4p6OIffO0wMxV55BUZ3osH7s7FBRiP+qdcghQs=';

export const LOCAL_GITHUB_MOCK_REPOSITORY_KEY_ID = 'local-mock';

export const LOCAL_GITHUB_MOCK_REPOSITORIES: GithubRepository[] = [
  {
    id: 900_001,
    name: 'demo-repo',
    owner: 'cryptly-local',
    avatarUrl: 'https://avatars.githubusercontent.com/u/9919?s=64&v=4',
    url: 'https://github.com/cryptly-local/demo-repo',
    isPrivate: false,
  },
  {
    id: 900_002,
    name: 'another-app',
    owner: 'cryptly-local',
    avatarUrl: 'https://avatars.githubusercontent.com/u/9919?s=64&v=4',
    url: 'https://github.com/cryptly-local/another-app',
    isPrivate: true,
  },
];
