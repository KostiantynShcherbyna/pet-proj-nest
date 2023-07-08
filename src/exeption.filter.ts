import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(Error)
export class ErrorExceptionFilter implements ExceptionFilter {
  catch(host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .send('Something wrong...');
  }
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse: any = exception.getResponse();
    if (
      status === HttpStatus.BAD_REQUEST &&
      Array.isArray(exceptionResponse.message)
    ) {
      const errorMessages = exceptionResponse.message.map((err) => {
        return {
          field: err.field,
          message: err.message[0],
        };
      });

      response.status(status).json({ errorMessages });
    } else {
      response.sendStatus(status);
    }
  }
}
