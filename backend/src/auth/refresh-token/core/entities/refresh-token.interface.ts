export class RefreshTokenNormalized {
  public id: string;
  public userId: string;
  public tokenHash: string;
  public expiresAt: Date;
  public revokedAt: Date | null;
  public createdAt: Date;
  public updatedAt: Date;
}
