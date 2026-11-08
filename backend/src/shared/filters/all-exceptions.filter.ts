import { Logger } from '@logdash/js-sdk';
import { ArgumentsHost, Catch, HttpException, HttpServer, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request } from 'express';
import { getOurEnv, OurEnv } from '../types/our-env.enum';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  public constructor(
    private readonly logger: Logger,
    applicationRef?: HttpServer,
  ) {
    super(applicationRef);
  }

  public catch(exception: unknown, host: ArgumentsHost): void {
    if (getOurEnv() !== OurEnv.Dev) {
      const ctx = host.switchToHttp();
      const request = ctx.getRequest<Request>();

      const status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;

      const message =
        exception instanceof HttpException ? exception.message : 'Internal server error';

      const errorResponse = exception instanceof HttpException ? exception.getResponse() : null;

      const details = {
        statusCode: status,
        message,
        method: request.method,
        path: request.url,
        timestamp: new Date().toISOString(),
        userId: (request as any).user?.id,
        error: exception instanceof Error ? exception.message : String(exception),
        responseBody: errorResponse,
      };

      if (status < HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.http('Request rejected', details);
      } else {
        this.logger.error('Unhandled Exception', {
          ...details,
          stack: exception instanceof Error ? exception.stack : undefined,
        });
      }
    }

    super.catch(exception, host);
  }
}
