import { Request, Response, NextFunction } from 'express';
import { ApplicationError } from '../../shared/errors/ApplicationError';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
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
