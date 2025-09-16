import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') || 3000;
  const env = configService.get<string>('app.env') || 'development';
  const apiPrefix = configService.get<string>('app.apiPrefix') || 'api';
  const isProduction = env === 'production';

  // Security middlewares
  app.use(helmet());
  
  // Enable CORS
  app.enableCors({
    origin: isProduction ? configService.get<string>('app.allowedOrigins') : '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Performance optimization
  app.use(compression.default());

  // Global prefix for all routes
  app.setGlobalPrefix(apiPrefix);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      disableErrorMessages: false,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation (only in non-production)
  if (!isProduction) {
    const options = new DocumentBuilder()
      .setTitle('API Documentation')
      .setDescription('API description')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  await app.listen(port);
  
  console.log(`\n`);
  console.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}`);
  if (!isProduction) {
    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  }
  console.log(`🌍 Environment: ${env}`);
  console.log(`\n`);
}

bootstrap().catch((err) => {
  console.error('Error during application startup', err);
  process.exit(1);
});
