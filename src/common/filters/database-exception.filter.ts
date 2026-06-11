import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception?.code === 11000) {
      return response.status(HttpStatus.CONFLICT).render('errors/error', {
        title: 'Conflict',
        status: HttpStatus.CONFLICT,
        message: 'Duplicate record',
        path: '',
      });
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).render('errors/error', {
      title: 'Database Error',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: exception?.message || 'Database operation failed',
      path: '',
    });
  }
}
