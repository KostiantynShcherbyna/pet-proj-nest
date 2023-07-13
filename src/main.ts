import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { settings } from "./settings"
import { ValidationPipe, BadRequestException } from "@nestjs/common"
import { ErrorExceptionFilter, HttpExceptionFilter } from "./filters/exeption.filter"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors()
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      transform: true,
      exceptionFactory: (errors) => {
        const customErrors = errors.map(err => {
          return {
            messages: Object.values(err.constraints!),
            field: err.property,
          }
        })

        throw new BadRequestException(customErrors)
      },
    }),
  )
  app.useGlobalFilters(new ErrorExceptionFilter(), new HttpExceptionFilter())


  await app.listen(3000)
}

// const customErrorsFunc = (errors) => {
//   const customErrors = errors.map(err => {
//     return {
//       field: err.property,
//       messages: Object.values(err.constraints!),
//     }
//   })
//
//   throw new BadRequestException(customErrors)
// }

bootstrap()
