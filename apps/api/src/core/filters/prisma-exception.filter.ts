import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    const errorMap: Record<string, { status: number; message: string }> = {
      P2002: { status: HttpStatus.CONFLICT, message: 'Record already exists' },
      P2003: { status: HttpStatus.BAD_REQUEST, message: 'Referenced record not found' },
      P2025: { status: HttpStatus.NOT_FOUND, message: 'Record not found' },
    };

    const mapped = errorMap[exception.code] || {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
    };

    response.status(mapped.status).json({
      statusCode: mapped.status,
      message: mapped.message,
      timestamp: new Date().toISOString(),
    });
  }
}
