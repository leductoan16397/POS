import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common/pipes';
// import * as compression from 'compression';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { ConfigService } from './module/common/config/config.service';
import { LoggingInterceptor, TransformInterceptor } from './common/interceptor/transform.interceptor';

dotenv.config();

async function bootstrap() {
  const configService = new ConfigService();
  configService.loadFromEnv();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
    bodyParser: true,
  });

  // Swagger
  const config = new DocumentBuilder()
    .addBearerAuth({
      type: 'http',
      description: 'Enter JWT token',
      in: 'header',
    })
    .setTitle('Mini Pos')
    .setDescription('The Mini Pos API description')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/swagger', app, document);

  app.useGlobalPipes(new ValidationPipe({ transform: true, transformOptions: { enableImplicitConversion: true } }));

  app.set('trust proxy', true);

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          imgSrc: [`'self'`, 'data:', 'https: data:', 'apollo-server-landing-page.cdn.apollographql.com'],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
          manifestSrc: [`'self'`, 'apollo-server-landing-page.cdn.apollographql.com'],
          frameSrc: [`'self'`, 'sandbox.embed.apollographql.com'],
        },
      },
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // app.use(compression());

  app.enableCors({
    credentials: true,
    optionsSuccessStatus: 204,
  });

  app.useBodyParser('json', {
    bodyLimit: configService.get().body_limit,
  });
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  await app.listen(configService.get().port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
