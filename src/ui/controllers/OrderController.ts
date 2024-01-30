import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { OrderService } from '../../application/services/OrderService';

@injectable()
export class OrderController {
  constructor(@inject('OrderService') private orderService: OrderService) {}
  async createOrder(req: Request, res: Response): Promise<Response> {
    try {
      const order = await this.orderService.createOrder(req.body);
      return res.status(201).json(order);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async updateOrder(req: Request, res: Response): Promise<Response> {
    try {
      const order = await this.orderService.updateOrder(
        req.params.id,
        req.body,
      );
      return res.status(200).json(order);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async deleteOrder(req: Request, res: Response): Promise<Response> {
    try {
      await this.orderService.deleteOrder(req.params.id);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getOrderById(req: Request, res: Response): Promise<Response> {
    try {
      const order = await this.orderService.findOrderById(req.params.id);
      return res.status(200).json(order);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getAllOrders(req: Request, res: Response): Promise<Response> {
    try {
      const orders = await this.orderService.listOrders();
      return res.status(200).json(orders);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
