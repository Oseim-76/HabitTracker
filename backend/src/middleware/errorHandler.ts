import {Request, Response, NextFunction} from 'express';

export class AppError extends Error {
  status: number;
  
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error details:', {
    name: err.name,
    message: err.message,
    code: (err as any).code,
    detail: (err as any).detail,
    stack: err.stack,
  });

  if (err instanceof AppError) {
    return res.status(err.status).json({
      status: 'error',
      message: err.message,
    });
  }

  // Handle database errors
  if ((err as any).code) {
    switch ((err as any).code) {
      case '23505': // Unique violation
        return res.status(409).json({
          status: 'error',
          message: 'A user with that email already exists',
        });
      case '42703': // Undefined column
        return res.status(500).json({
          status: 'error',
          message: 'Database schema error',
        });
      default:
        return res.status(500).json({
          status: 'error',
          message: 'Database error',
        });
    }
  }

  // Default 500 error
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Internal server error',
  });
}; 