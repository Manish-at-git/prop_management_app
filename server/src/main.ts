import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { winstonConfig } from './common/logger/winston.config';
import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';

async function bootstrap() {
  // Create app with Winston logger
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  // ─── Security Middleware ───────────────────────────────────────────────────
  app.use(helmet());

  // CORS – in production, configure allowed origins via env
  app.enableCors({
    origin: nodeEnv === 'production' ? configService.get<string>('ALLOWED_ORIGINS', '') : true,
    credentials: true,
  });

  // ─── Global Prefix ────────────────────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ─── Global Pipes ─────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error on unknown properties
      transform: true,            // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ─── Global Filters ───────────────────────────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());

  // ─── Global Interceptors ──────────────────────────────────────────────────
  app.useGlobalInterceptors(new TransformInterceptor());

  // ─── Swagger Documentation ────────────────────────────────────────────────
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Community & Association Management SaaS API')
      .setDescription(
        'REST API for managing associations, residents, access codes, maintenance requests, documents, and notifications.',
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
        'JWT-auth',
      )
      .addTag('Authentication', 'Login, register with access code, request a code')
      .addTag('Users', 'User profile management')
      .addTag('Associations', 'Association management')
      .addTag('Access Codes', 'Access code generation and management')
      .addTag('Code Requests', 'New member access code requests')
      .addTag('Correction Requests', 'Profile detail correction requests')
      .addTag('Documents', 'Document sharing within an association')
      .addTag('Maintenance Requests', 'Report and manage maintenance issues')
      .addTag('Notifications', 'In-app notification management')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api-docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
      },
    });
  }

  // ─── Start Server ─────────────────────────────────────────────────────────
  await app.listen(port);

  const logger = winston.createLogger(winstonConfig);
  logger.info(`🚀 Application running on: http://localhost:${port}/api`);
  if (nodeEnv !== 'production') {
    logger.info(`📚 Swagger docs available at: http://localhost:${port}/api-docs`);
  }
}

bootstrap();
