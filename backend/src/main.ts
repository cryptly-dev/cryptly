import { Logger } from '@logdash/js-sdk';
import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';
import { MetricsInterceptor } from './shared/posthog/metrics.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });

  // registering any parser manually disables Nest's default ones, so both are listed
  app.useBodyParser('json', { limit: '1mb' });
  app.useBodyParser('urlencoded', { extended: true, limit: '1mb' });

  app.enableCors({ origin: '*' });

  app.useGlobalFilters(
    new AllExceptionsFilter(app.get(Logger), app.get(HttpAdapterHost).httpAdapter),
  );
  app.useGlobalInterceptors(new MetricsInterceptor(app.get(Reflector)));

  const config = new DocumentBuilder()
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', in: 'header', name: 'project-api-key' }, 'project-api-key')
    .setTitle('Cryptly')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.init();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

process.on('uncaughtException', (error) => {
  console.error(error);
});

process.on('unhandledRejection', (error) => {
  console.error(error);
});

process.on('uncaughtExceptionMonitor', (error) => {
  console.error(error);
});
