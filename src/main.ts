import { ValidationPipe } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { NestFactory } from "@nestjs/core"
import { useContainer } from "class-validator"
import cookieParser from "cookie-parser"
import { AppModule } from "./app.module"
import { ErrorExceptionFilter, HttpExceptionFilter } from "./infrastructure/filters/exeption.filter"
import { errorsFactory } from "./infrastructure/adapters/exception-message.factory.adapter"
import { appSettings } from "./app.settings"



async function bootstrap() {

  const app = await NestFactory.create(AppModule)
  appSettings(app)

  // app.use(cookieParser());
  // app.enableCors()
  // useContainer(app.select(AppModule), { fallbackOnErrors: true })

  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     transform: true,
  //     stopAtFirstError: true,
  //     exceptionFactory: errorsFactory
  //   }),
  // )
  // app.useGlobalFilters(
  //   new ErrorExceptionFilter(),
  //   new HttpExceptionFilter()
  // )

  const configService = app.get(ConfigService);
  const port = configService.get('PORT', 5000);
  await app.listen(port)
}

bootstrap()
