import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';
import { OrderService } from '../../application/services/OrderService';
import { ApplicationError } from '../../infrastructure/shared/errors/ApplicationError';
import { OrderStatusValidator } from '../../infrastructure/shared/utils/validateOrderStatus';
import { OrderStatus } from '../../domain/enums/OrderStatus';

@injectable()
export class OrderController {
  constructor(@inject('OrderService') private orderService: OrderService) {}

  async createOrder(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const orderDto = await this.orderService.createOrder(req.body);
      res.status(201).json(orderDto);
    } catch (error: any) {
      if (error instanceof ApplicationError) {
        next(error);
      } else {
        next(
          new ApplicationError('Failed to create order', 500, true, [
            { key: 'internal', value: error.message || 'Unknown error' },
          ]),
        );
      }
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
      if (error instanceof ApplicationError) {
        next(error);
      } else {
        next(
          new ApplicationError('Failed to update order', 500, true, [
            {
              key: 'internal',
              value: error.message || 'Error during order update',
            },
          ]),
        );
      }
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
      if (error instanceof ApplicationError) {
        next(error);
      } else {
        next(
          new ApplicationError('Failed to delete order', 500, true, [
            {
              key: 'internal',
              value: error.message || 'Error during order deletion',
            },
          ]),
        );
      }
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
      res.json(orderDto);
    } catch (error: any) {
      if (error instanceof ApplicationError) {
        next(error);
      } else {
        next(
          new ApplicationError('Failed to retrieve order', 500, true, [
            {
              key: 'internal',
              value: error.message || 'Error during retrieval of order',
            },
          ]),
        );
      }
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
      res.json(ordersDto);
    } catch (error: any) {
      if (error instanceof ApplicationError) {
        next(error);
      } else {
        next(
          new ApplicationError('Failed to list orders', 500, true, [
            {
              key: 'internal',
              value: error.message || 'Error during listing orders',
            },
          ]),
        );
      }
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
      res.json(orderDto);
    } catch (error: any) {
      if (error instanceof ApplicationError) {
        next(error);
      } else {
        next(
          new ApplicationError('Failed to mark order as waiting', 500, true, [
            {
              key: 'internal',
              value: error.message || 'Error during order status change',
            },
          ]),
        );
      }
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
      res.json(orderDto);
    } catch (error: any) {
      if (error instanceof ApplicationError) {
        next(error);
      } else {
        next(
          new ApplicationError('Failed to pickup order', 500, true, [
            {
              key: 'internal',
              value: error.message || 'Error during picking up the order',
            },
          ]),
        );
      }
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
      res.json(orderDto);
    } catch (error: any) {
      if (error instanceof ApplicationError) {
        next(error);
      } else {
        next(
          new ApplicationError('Failed to mark order as delivered', 500, true, [
            {
              key: 'internal',
              value: error.message || 'Error during order delivery',
            },
          ]),
        );
      }
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
      res.json(orderDto);
    } catch (error: any) {
      if (error instanceof ApplicationError) {
        next(error);
      } else {
        next(
          new ApplicationError('Failed to return order', 500, true, [
            {
              key: 'internal',
              value: error.message || 'Error during returning the order',
            },
          ]),
        );
      }
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
      res.json(ordersDto);
    } catch (error: any) {
      if (error instanceof ApplicationError) {
        next(error);
      } else {
        next(
          new ApplicationError('Failed to list deliveries', 500, true, [
            {
              key: 'internal',
              value: error.message || 'Error during listing deliveries',
            },
          ]),
        );
      }
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
      res.json(ordersDto);
    } catch (error: any) {
      if (error instanceof ApplicationError) {
        next(error);
      } else {
        next(
          new ApplicationError('Failed to list own deliveries', 500, true, [
            {
              key: 'internal',
              value: error.message || 'Error during listing own deliveries',
            },
          ]),
        );
      }
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
      res.json(deliveries);
    } catch (error: any) {
      if (error instanceof ApplicationError) {
        next(error);
      } else {
        next(
          new ApplicationError('Failed to find nearby deliveries', 500, true, [
            {
              key: 'internal',
              value: error.message || 'Error during finding deliveries',
            },
          ]),
        );
      }
    }
  }
}
