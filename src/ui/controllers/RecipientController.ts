import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { RecipientService } from '../../application/services/RecipientService';

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
      next(error);
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
      next(error);
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
      next(error);
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
        res.status(404).json({ message: 'Recipient not found' });
        return;
      }
      res.status(200).json(recipient);
    } catch (error) {
      next(error);
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
    } catch (error) {
      next(error);
    }
  }
}
