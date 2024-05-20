import { Request, Response, NextFunction } from 'express';
import { ApplicationError } from '../../infrastructure/shared/errors/ApplicationError';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ApplicationError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        details: err.details || [],
      },
    });
  }

  console.error('Unhandled Error:', err);
  return res.status(500).json({
    error: {
      message: 'Internal Server Error',
      details: [],
    },
  });
};
