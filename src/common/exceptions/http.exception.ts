import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest<Request>();
    const exceptionResponse: any = exception.getResponse();

    const status =
      exceptionResponse['status'] == null
        ? exception.getStatus().toString()
        : exceptionResponse['status'];
    let message = '';
    let message_list: string[] | undefined = undefined;

    if (
      typeof exceptionResponse['message'] == 'object' &&
      exceptionResponse['message'].length > 0
    ) {
      message = exceptionResponse['message'][0];
      message_list = exceptionResponse['message'];
    } else {
      message = exceptionResponse['message'];
    }

    if (exception.getStatus() == HttpStatus.INTERNAL_SERVER_ERROR) {
      Logger.error(
        `${request.method} ${request.url}`,
        JSON.stringify({
          status: status,
          timestamp: new Date().toISOString(),
          path: request.url,
          error: exceptionResponse['error'],
          message: message,
          message_list: message_list,
        }),
        'ExceptionFilter',
      );
    }

    response.status(exception.getStatus()).send({
      status: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: exceptionResponse['error'],
      message: message,
      message_list: message_list,
    });
  }
}
