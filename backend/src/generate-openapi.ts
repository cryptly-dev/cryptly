import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.OUR_ENV ??= 'dev';
process.env.JWT_SECRET ??= 'openapi-generation';
process.env.GH_CLIENT_ID ??= 'openapi-generation';
process.env.GH_CLIENT_SECRET ??= 'openapi-generation';
process.env.GOOGLE_CLIENT_ID ??= 'openapi-generation';
process.env.GOOGLE_CLIENT_SECRET ??= 'openapi-generation';
process.env.GOOGLE_REDIRECT_URI ??= 'http://localhost:5173/app/callbacks/oauth/google';
process.env.GOOGLE_REDIRECT_URI_ALTERNATIVE ??= 'http://localhost:5173/app/callbacks/oauth/google';
process.env.LOGDASH_API_KEY ??= 'openapi-generation';
process.env.POSTHOG_API_KEY ??= 'openapi-generation';
process.env.POSTHOG_HOST ??= 'http://localhost';
process.env.GH_CRYPTLY_APP_ID ??= '0';
process.env.GH_CRYPTLY_APP_PRIVATE_KEY ??= 'openapi-generation';
process.env.GH_WEBHOOKS_SECRET ??= 'openapi-generation';

async function generateOpenApi(): Promise<void> {
  const mongo = await MongoMemoryServer.create({
    instance: {
      ip: '127.0.0.1',
      port: 27018,
    },
  });
  process.env.MONGO_URL = mongo.getUri();

  const { AppModule } = await import('./app.module');
  const { createOpenApiDocument } = await import('./openapi');
  const app = await NestFactory.create(AppModule, { logger: false });
  const document = createOpenApiDocument(app);
  const outputPath = resolve(process.cwd(), '../packages/backend-sdk/openapi.json');

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`);
  await app.close();
  await mongo.stop();
}

void generateOpenApi();
