export class ApiResponseError<TDetails = unknown> extends Error {
  public readonly status: number | undefined;
  public readonly details: TDetails;

  public constructor(details: TDetails, status?: number) {
    super('Cryptly API request failed');
    this.name = 'ApiResponseError';
    this.details = details;
    this.status = status;
  }
}
