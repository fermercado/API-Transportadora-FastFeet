import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { OrderService } from '../../application/services/OrderService';
import { ApplicationError } from '../../shared/errors/ApplicationError';
import { OrderResponseDto } from '../../application/dtos/order/ResponseOrderDto';
import { ErrorDetail } from '../../@types/error-types';
import { Order } from '../../domain/entities/Order';

@injectable()
export class OrderController {
  constructor(@inject('OrderService') private orderService: OrderService) {}

  async createOrder(req: Request, res: Response): Promise<Response> {
    try {
      const order = await this.orderService.createOrder(req.body);
      return res.status(201).json(order);
    } catch (error) {
      if (error instanceof ApplicationError) {
        return res.status(error.statusCode).json({
          error: error.message,
          details: error.details as ErrorDetail[],
        });
      }
      console.error('Unexpected error occurred:', error);
      return res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }

  async updateOrder(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    try {
      const order = await this.orderService.updateOrder(id, req.body);
      return res.status(200).json(order);
    } catch (error) {
      if (error instanceof ApplicationError) {
        return res.status(error.statusCode).json({
          error: error.message,
          details: error.details as ErrorDetail[],
        });
      }
      console.error('Unexpected error occurred:', error);
      return res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }

  async deleteOrder(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    try {
      await this.orderService.deleteOrder(id);
      return res.status(204).send();
    } catch (error) {
      if (error instanceof ApplicationError) {
        return res.status(error.statusCode).json({
          message: error.message,
          details: error.details as ErrorDetail[],
        });
      }
      console.error('Unexpected error occurred:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async getOrderById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    try {
      const order = await this.orderService.getOrderById(id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      return res.json(this.mapOrderToResponseDto(order));
    } catch (error) {
      if (error instanceof ApplicationError) {
        return res.status(error.statusCode).json({
          message: error.message,
          details: error.details as ErrorDetail[],
        });
      }
      console.error('Unexpected error occurred:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async listOrders(req: Request, res: Response): Promise<Response> {
    try {
      const orders = await this.orderService.listOrders();
      return res.json(orders);
    } catch (error) {
      if (error instanceof ApplicationError) {
        return res.status(error.statusCode).json({
          message: error.message,
          details: error.details as ErrorDetail[],
        });
      }
      console.error('Unexpected error occurred:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async markOrderAsWaiting(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    try {
      const order = await this.orderService.markOrderAsWaiting(id);
      return res.json(order);
    } catch (error: any) {
      console.error('Error marking order as waiting:', error);
      return res.status(400).json({ message: error.message });
    }
  }

  async pickupOrder(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const deliverymanId = req.user.id;
    try {
      const order = await this.orderService.pickupOrder(id, deliverymanId);
      return res.json(order);
    } catch (error: any) {
      console.error('Error picking up order:', error);
      return res.status(400).json({ message: error.message });
    }
  }

  async markOrderAsDelivered(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const deliverymanId = req.user.id;
    if (!req.file) {
      return res
        .status(400)
        .json({ message: 'Delivery photo file is required.' });
    }
    const imageFile = req.file as Express.Multer.File;
    try {
      const order = await this.orderService.markOrderAsDelivered(
        id,
        deliverymanId,
        imageFile,
      );
      return res.json(order);
    } catch (error: any) {
      console.error('Error marking order as delivered:', error);
      return res.status(400).json({ message: error.message });
    }
  }

  async returnOrder(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const deliverymanId = req.user.id;
    try {
      const order = await this.orderService.returnOrder(id, deliverymanId);
      return res.json(order);
    } catch (error: any) {
      console.error('Error returning order:', error);
      return res.status(400).json({ message: error.message });
    }
  }

  async listDeliveriesForDeliveryman(
    req: Request,
    res: Response,
  ): Promise<Response> {
    const deliverymanId = req.user.id;
    try {
      const orders =
        await this.orderService.findDeliveriesForDeliverer(deliverymanId);

      const ordersDto = orders.map((order) =>
        this.mapOrderToResponseDto(order),
      );

      return res.json(ordersDto);
    } catch (error: any) {
      console.error('Error listing deliveries for deliveryman:', error);
      return res.status(500).json({ message: error.message });
    }
  }

  async findNearbyDeliveries(req: Request, res: Response): Promise<Response> {
    const deliverymanId = req.user.id;
    const { zipCode } = req.body;
    try {
      const deliveries = await this.orderService.findNearbyDeliveries(
        deliverymanId,
        zipCode,
      );

      const deliveriesDto = deliveries.map((delivery) => {
        return {
          ...delivery,
          order: this.mapOrderToResponseDto(delivery.order),
        };
      });

      return res.json(deliveriesDto);
    } catch (error: any) {
      console.error('Error finding nearby deliveries:', error);
      return res.status(500).json({ message: error.message });
    }
  }

  private mapOrderToResponseDto(order: Order): OrderResponseDto {
    return {
      id: order.id,
      trackingCode: order.trackingCode,
      status: order.status,
      deliveryPhoto: order.deliveryPhoto,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      recipient: order.recipient
        ? {
            id: order.recipient.id,
            firstName: order.recipient.firstName,
            lastName: order.recipient.lastName,
            email: order.recipient.email,
            cpf: order.recipient.cpf,
            zipCode: order.recipient.zipCode,
            street: order.recipient.street,
            number: order.recipient.number,
            complement: order.recipient.complement || '',
            neighborhood: order.recipient.neighborhood,
            city: order.recipient.city,
            state: order.recipient.state,
          }
        : undefined,
      deliveryman: order.deliveryman
        ? {
            id: order.deliveryman.id,
            firstName: order.deliveryman.firstName,
            lastName: order.deliveryman.lastName,
            email: order.deliveryman.email,
            cpf: order.deliveryman.cpf,
            role: order.deliveryman.role,
          }
        : undefined,
    };
  }
}
