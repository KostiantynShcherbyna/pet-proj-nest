import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, } from "@nestjs/common"
import { Response } from "express"

@Catch(Error)
export class ErrorExceptionFilter implements ExceptionFilter {
  catch(host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    return response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .send("Something wrong...")
  }
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>()
    const status = exception.getStatus()
    const exceptionResponse: any = exception.getResponse()

    if (status === HttpStatus.BAD_REQUEST) {
      const errorMessages = this.messagesModify(exceptionResponse)
      console.log("BAD_REQUEST - " + errorMessages)
      return errorMessages
        ? response.status(status).json({ errorMessages })
        : response.sendStatus(status)
    }
    if (status === HttpStatus.NOT_FOUND) {
      const errorMessages = this.messagesModify(exceptionResponse)
      console.log("NOT_FOUND - " + errorMessages)
      return errorMessages
        ? response.status(status).json({ errorMessages })
        : response.sendStatus(status)
    }

    return response.sendStatus(status)
  }

  private messagesModify(exceptionResponse: any) {

    return Array.isArray(exceptionResponse.message)
      ? exceptionResponse.message.map(err => {
        return {
          field: err.field,
          message: err.messages[0],
        }
      })
      : null
  }

}

// @Catch(HttpException)
// export class HttpExceptionFilter implements ExceptionFilter {
//   catch(exception: HttpException, host: ArgumentsHost) {
//     const response = host.switchToHttp().getResponse<Response>();
//     const status = exception.getStatus();
//     const exceptionResponse: any = exception.getResponse();
//     if (status === HttpStatus.BAD_REQUEST && Array.isArray(exceptionResponse.message)) {
//       const errorMessages = exceptionResponseMap(exceptionResponse)

//       response.status(status).json({ errorMessages });
//       return
//     }

//     response.sendStatus(status);
//     return


//     function exceptionResponseMap(exceptionResponse: any) {
//       const errorMessages = exceptionResponse.message.map(err => {
//         return {
//           field: err.field,
//           message: err.message[0],
//         };
//       });

//       return errorMessages
//     }
//   }


// }


