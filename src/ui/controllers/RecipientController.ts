import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { RecipientService } from '../../application/services/RecipientService';
import { ApplicationError } from '../../shared/errors/ApplicationError';
import { ErrorDetail } from '../../@types/error-types';

@injectable()
export class RecipientController {
  constructor(
    @inject('RecipientService') private recipientService: RecipientService,
  ) {}

  async createRecipient(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const recipient = await this.recipientService.createRecipient(req.body);
      res.status(201).json(recipient);
    } catch (error: unknown) {
      const details: ErrorDetail[] = [
        { key: 'endpoint', value: 'createRecipient' },
        { key: 'method', value: 'POST' },
        { key: 'message', value: (error as Error).message },
      ];
      const appError =
        error instanceof ApplicationError
          ? error
          : new ApplicationError(
              'Failed to create recipient',
              500,
              true,
              details,
            );
      console.error(appError.formatForLogging());
      next(appError);
    }
  }

  async updateRecipient(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const recipient = await this.recipientService.updateRecipient(
        req.params.id,
        req.body,
      );
      res.status(200).json(recipient);
    } catch (error: unknown) {
      const details: ErrorDetail[] = [
        { key: 'endpoint', value: 'updateRecipient' },
        { key: 'method', value: 'PUT' },
        { key: 'recipientId', value: req.params.id },
        { key: 'message', value: (error as Error).message },
      ];
      const appError =
        error instanceof ApplicationError
          ? error
          : new ApplicationError(
              'Failed to update recipient',
              500,
              true,
              details,
            );
      console.error(appError.formatForLogging());
      next(appError);
    }
  }

  async deleteRecipient(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await this.recipientService.deleteRecipient(req.params.id);
      res.status(204).send();
    } catch (error: unknown) {
      const details: ErrorDetail[] = [
        { key: 'endpoint', value: 'deleteRecipient' },
        { key: 'method', value: 'DELETE' },
        { key: 'recipientId', value: req.params.id },
      ];
      const appError =
        error instanceof ApplicationError
          ? error
          : new ApplicationError(
              'Failed to delete recipient',
              500,
              true,
              details,
            );
      console.error(appError.formatForLogging());
      next(appError);
    }
  }

  async getRecipientById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const recipient = await this.recipientService.findRecipientById(
        req.params.id,
      );
      if (!recipient) {
        const notFoundError = new ApplicationError(
          'Recipient not found',
          404,
          true,
          [{ key: 'recipientId', value: req.params.id }],
        );
        console.error(notFoundError.formatForLogging());
        next(notFoundError);
        return;
      }
      res.status(200).json(recipient);
    } catch (error: unknown) {
      const details: ErrorDetail[] = [
        { key: 'endpoint', value: 'getRecipientById' },
        { key: 'method', value: 'GET' },
        { key: 'recipientId', value: req.params.id },
      ];
      const appError =
        error instanceof ApplicationError
          ? error
          : new ApplicationError('Failed to get recipient', 500, true, details);
      console.error(appError.formatForLogging());
      next(appError);
    }
  }

  async getAllRecipients(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const recipients = await this.recipientService.listRecipients();
      res.status(200).json(recipients);
    } catch (error: unknown) {
      const details: ErrorDetail[] = [
        { key: 'endpoint', value: 'listRecipients' },
        { key: 'method', value: 'GET' },
      ];
      const appError =
        error instanceof ApplicationError
          ? error
          : new ApplicationError(
              'Failed to list recipients',
              500,
              true,
              details,
            );
      console.error(appError.formatForLogging());
      next(appError);
    }
  }
}
