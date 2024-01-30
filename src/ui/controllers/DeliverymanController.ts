import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { DeliverymanService } from '../../application/services/DeliverymanService';

@injectable()
export class DeliverymanController {
  constructor(
    @inject('DeliverymanService')
    private deliverymanService: DeliverymanService,
  ) {}

  async createDeliveryman(req: Request, res: Response): Promise<Response> {
    try {
      const deliveryman = await this.deliverymanService.createDeliveryman(
        req.body,
      );
      return res.status(201).json(deliveryman);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async updateDeliveryman(req: Request, res: Response): Promise<Response> {
    try {
      const deliveryman = await this.deliverymanService.updateDeliveryman(
        req.params.id,
        req.body,
      );
      return res.status(200).json(deliveryman);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async deleteDeliveryman(req: Request, res: Response): Promise<Response> {
    try {
      await this.deliverymanService.deleteDeliveryman(req.params.id);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getDeliverymanById(req: Request, res: Response): Promise<Response> {
    try {
      const deliveryman = await this.deliverymanService.findDeliverymanById(
        req.params.id,
      );
      return res.status(200).json(deliveryman);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getAllDeliverymen(req: Request, res: Response): Promise<Response> {
    try {
      const deliverymen = await this.deliverymanService.listDeliverymen();
      return res.status(200).json(deliverymen);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
