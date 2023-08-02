import { ValidationPipe } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { NestFactory } from "@nestjs/core"
import { useContainer } from "class-validator"
import cookieParser from "cookie-parser"
import { AppModule } from "./app.module"
import { ErrorExceptionFilter, HttpExceptionFilter } from "./infrastructure/filters/exeption.filter"
import { errorsFactory } from "./infrastructure/adapters/exception-message.factory.adapter"



async function bootstrap() {

  const app = await NestFactory.create(AppModule)
  app.use(cookieParser());
  app.enableCors()
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: errorsFactory
    }),
  )
  app.useGlobalFilters(
    new ErrorExceptionFilter(),
    new HttpExceptionFilter()
  )
  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  const configService = app.get(ConfigService);
  const port = configService.get('PORT', 5000);
  await app.listen(port)
}

bootstrap()
