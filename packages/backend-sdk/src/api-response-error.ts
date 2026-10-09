export class ApiResponseError<TDetails = unknown> extends Error {
  public readonly status: number | undefined;
  public readonly details: TDetails;

  public constructor(details: TDetails, status?: number, message = 'Cryptly API request failed') {
    super(message);
    this.name = 'ApiResponseError';
    this.details = details;
    this.status = status;
  }
}
