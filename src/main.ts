import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { configuration } from "./configuration"
import { ValidationPipe, BadRequestException } from "@nestjs/common"
import { ErrorExceptionFilter, HttpExceptionFilter } from "./filters/exeption.filter"
import cookieParser from "cookie-parser"
import { useContainer } from "class-validator"
import { errorsFactory } from "./utils/factory/errors.factory"



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

  await app.listen(configuration().PORT)
}

bootstrap()
