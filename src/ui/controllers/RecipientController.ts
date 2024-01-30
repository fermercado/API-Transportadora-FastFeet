import { injectable, inject } from 'tsyringe';
import { Request, Response } from 'express';
import { RecipientService } from '../../application/services/RecipientService';

@injectable()
export class RecipientController {
  constructor(
    @inject(RecipientService) private recipientService: RecipientService,
  ) {}

  async createRecipient(req: Request, res: Response): Promise<Response> {
    try {
      const recipient = await this.recipientService.createRecipient(req.body);
      return res.status(201).json(recipient);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async updateRecipient(req: Request, res: Response): Promise<Response> {
    try {
      const recipient = await this.recipientService.updateRecipient(
        req.params.id,
        req.body,
      );
      return res.status(200).json(recipient);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async deleteRecipient(req: Request, res: Response): Promise<Response> {
    try {
      await this.recipientService.deleteRecipient(req.params.id);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getRecipientById(req: Request, res: Response): Promise<Response> {
    try {
      const recipient = await this.recipientService.findRecipientById(
        req.params.id,
      );
      return recipient
        ? res.status(200).json(recipient)
        : res.status(404).json({ message: 'Recipient not found' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getAllRecipients(req: Request, res: Response): Promise<Response> {
    try {
      const recipients = await this.recipientService.listRecipients();
      return res.status(200).json(recipients);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
