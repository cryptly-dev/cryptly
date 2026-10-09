import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function createOpenApiDocument(app: INestApplication) {
  const config = new DocumentBuilder()
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', in: 'header', name: 'project-api-key' }, 'project-api-key')
    .setTitle('Cryptly')
    .build();

  return SwaggerModule.createDocument(app, config);
}
