import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';
import { OrderService } from '../../application/services/OrderService';
import { ApplicationError } from '../../infrastructure/shared/errors/ApplicationError';
import { OrderStatusValidator } from '../../infrastructure/shared/utils/validateOrderStatus';
import { OrderStatus } from '../../domain/enums/OrderStatus';

@injectable()
export class OrderController {
  constructor(@inject('OrderService') private orderService: OrderService) {}

  public handleError(
    error: any,
    defaultMessage: string,
    next: NextFunction,
  ): void {
    if (error instanceof ApplicationError) {
      next(error);
    } else {
      const errorMessage = error.message || 'Unknown error';
      const applicationError = new ApplicationError(defaultMessage, 500, true, [
        { key: 'internal', value: errorMessage },
      ]);
      next(applicationError);
    }
  }

  async createOrder(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const orderDto = await this.orderService.createOrder(req.body);
      res.status(201).json(orderDto);
    } catch (error: any) {
      console.error('Error caught in createOrder:', error);
      this.handleError(error, 'Failed to create order', next);
    }
  }

  async updateOrder(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const orderDto = await this.orderService.updateOrder(
        req.params.id,
        req.body,
      );
      res.status(200).json(orderDto);
    } catch (error: any) {
      this.handleError(error, 'Failed to update order', next);
    }
  }

  async deleteOrder(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await this.orderService.deleteOrder(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      this.handleError(error, 'Failed to delete order', next);
    }
  }

  async getOrderById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const orderDto = await this.orderService.getOrderById(req.params.id);
      if (!orderDto) {
        throw new ApplicationError('Order not found', 404, true);
      }
      res.status(200).json(orderDto);
    } catch (error: any) {
      this.handleError(error, 'Failed to retrieve order', next);
    }
  }

  async listOrders(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const status = OrderStatusValidator.validate(req.query.status);
      const ordersDto = await this.orderService.listOrders(status);
      res.status(200).json(ordersDto);
    } catch (error: any) {
      this.handleError(error, 'Failed to list orders', next);
    }
  }

  async markOrderAsWaiting(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const orderDto = await this.orderService.markOrderAsWaiting(
        req.params.id,
        req.user.id,
        req.user.role,
      );
      res.status(200).json(orderDto);
    } catch (error: any) {
      this.handleError(error, 'Failed to mark order as waiting', next);
    }
  }

  async pickupOrder(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const orderDto = await this.orderService.pickupOrder(
        req.params.id,
        req.user.id,
        req.user.role,
      );
      res.status(200).json(orderDto);
    } catch (error: any) {
      this.handleError(error, 'Failed to pickup order', next);
    }
  }

  async markOrderAsDelivered(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.file) {
        throw new ApplicationError(
          'Delivery photo file is required.',
          400,
          true,
        );
      }
      const orderDto = await this.orderService.markOrderAsDelivered(
        req.params.id,
        req.user.id,
        req.file,
      );
      res.status(200).json(orderDto);
    } catch (error: any) {
      this.handleError(error, 'Failed to mark order as delivered', next);
    }
  }

  async returnOrder(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const orderDto = await this.orderService.returnOrder(
        req.params.id,
        req.user.id,
        req.user.role,
      );
      res.status(200).json(orderDto);
    } catch (error: any) {
      this.handleError(error, 'Failed to return order', next);
    }
  }

  async listDeliveriesForDeliveryman(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const deliverymanId = req.params.deliverymanId;
      const status = req.query.status as OrderStatus | undefined;
      const ordersDto = await this.orderService.findDeliveriesForDeliverer(
        deliverymanId,
        status,
      );
      res.status(200).json(ordersDto);
    } catch (error: any) {
      this.handleError(error, 'Failed to list deliveries', next);
    }
  }

  async listOwnDeliveries(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const deliverymanId = req.user.id;
      const status = req.query.status as OrderStatus | undefined;
      const ordersDto = await this.orderService.findDeliveriesForDeliverer(
        deliverymanId,
        status,
      );
      res.status(200).json(ordersDto);
    } catch (error: any) {
      this.handleError(error, 'Failed to list own deliveries', next);
    }
  }

  async findNearbyDeliveries(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const deliveries = await this.orderService.findNearbyDeliveries(
        req.user.id,
        req.body.zipCode,
      );
      res.status(200).json(deliveries);
    } catch (error: any) {
      this.handleError(error, 'Failed to find nearby deliveries', next);
    }
  }
}
