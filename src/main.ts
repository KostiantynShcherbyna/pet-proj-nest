import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { configuration } from "./configuration"
import { ValidationPipe, BadRequestException } from "@nestjs/common"
import { ErrorExceptionFilter, HttpExceptionFilter } from "./filters/exeption.filter"
import cookieParser from "cookie-parser"
import { useContainer } from "class-validator"
import { errorsFactory } from "./utils/factory/errors.factory"
import { ConfigService } from "@nestjs/config"



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
  app.useGlobalFilters(new ErrorExceptionFilter(), new HttpExceptionFilter())
  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  const configService = app.get(ConfigService);
  const port = configService.get('PORT', 5000);
  await app.listen(port)
}

bootstrap()
