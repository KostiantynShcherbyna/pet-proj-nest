import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { settings } from './settings';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './exeptionFilter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(settings.PORT);
}
bootstrap();
