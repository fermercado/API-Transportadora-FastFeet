import { NextFunction, Request, Response } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      console.error(error);

      if (error instanceof ZodError) {
        const errors = error.errors
          .map((err) => `${err.path.join('.')}: ${err.message}`)
          .join(', ');
        return res
          .status(400)
          .json({ message: 'Validation errors', details: errors });
      }

      if (
        error instanceof Error &&
        error.message.startsWith('Falha ao obter dados completos do CEP')
      ) {
        return res.status(400).json({ message: error.message });
      }

      return res.status(500).json({ message: 'An unexpected error occurred' });
    }
  };
};
