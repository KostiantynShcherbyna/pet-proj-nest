import { INestApplication, ValidationPipe } from "@nestjs/common"
import cookieParser from "cookie-parser";
import { errorsFactory } from "./infrastructure/adapters/exception-message.factory.adapter";
import { ErrorExceptionFilter, HttpExceptionFilter } from "./infrastructure/filters/exeption.filter";
import { useContainer } from "class-validator";
import { AppModule } from "./app.module";

export const appSettings = (app: INestApplication) => {
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
    return app
}