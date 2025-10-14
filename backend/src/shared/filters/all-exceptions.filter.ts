import { Logger } from '@logdash/js-sdk';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { getOurEnv, OurEnv } from '../types/our-env.enum';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  public constructor(private readonly logger: Logger) {}

  public catch(exception: unknown, host: ArgumentsHost): void {
    if (getOurEnv() === OurEnv.Dev) {
      throw exception;
    }

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException ? exception.message : 'Internal server error';

    const errorResponse = exception instanceof HttpException ? exception.getResponse() : null;

    this.logger.error('Unhandled Exception', {
      statusCode: status,
      message,
      method: request.method,
      path: request.url,
      timestamp: new Date().toISOString(),
      userId: (request as any).user?.id,
      error: exception instanceof Error ? exception.message : String(exception),
      stack: exception instanceof Error ? exception.stack : undefined,
      responseBody: errorResponse,
    });

    throw exception;
  }
}
