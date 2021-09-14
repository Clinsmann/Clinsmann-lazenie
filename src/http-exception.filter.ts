import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { v4 as UUIDv4 } from 'uuid';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    // todo: handle specific database errors
    response.status(status).json({
      errorId: UUIDv4(),
      message: exception.message,
      error: exception?.response?.message,
      statusCode: exception?.response?.status || status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
