import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { RecipientService } from '../../application/services/RecipientService';
import { ApplicationError } from '../../infrastructure/shared/errors/ApplicationError';

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
    } catch (error) {
      next(
        error instanceof ApplicationError
          ? error
          : new ApplicationError('Failed to create recipient', 500, true, [
              { key: 'internal', value: 'Error during recipient creation' },
            ]),
      );
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
    } catch (error) {
      next(
        error instanceof ApplicationError
          ? error
          : new ApplicationError('Failed to update recipient', 500, true, [
              { key: 'internal', value: 'Error during recipient update' },
            ]),
      );
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
    } catch (error) {
      next(
        error instanceof ApplicationError
          ? error
          : new ApplicationError('Failed to delete recipient', 500, true, [
              { key: 'internal', value: 'Error during recipient deletion' },
            ]),
      );
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
        throw new ApplicationError('Recipient not found', 404);
      }
      res.status(200).json(recipient);
    } catch (error) {
      next(error);
    }
  }

  async getAllRecipients(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const recipients = await this.recipientService.listRecipients();
      res.status(200).json(recipients);
    } catch (error) {
      next(
        error instanceof ApplicationError
          ? error
          : new ApplicationError('Failed to list recipients', 500, true, [
              { key: 'internal', value: 'Error during listing recipients' },
            ]),
      );
    }
  }
}
