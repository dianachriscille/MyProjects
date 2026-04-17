import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  app.enableCors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true });

  // Serve Nuxt 3 static output in production
  if (process.env.NODE_ENV === 'production') {
    app.useStaticAssets(join(__dirname, '..', 'public'));
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`EduCore API running on port ${port}`);
}
bootstrap();
