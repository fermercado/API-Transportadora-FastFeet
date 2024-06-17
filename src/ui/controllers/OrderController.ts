import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';
import { OrderService } from '../../application/services/OrderService';
import { ApplicationError } from '../../infrastructure/shared/errors/ApplicationError';
import { OrderStatusValidator } from '../../infrastructure/shared/utils/validateOrderStatus';
import { OrderStatus } from '../../domain/enums/OrderStatus';
import { TransitionOrderDto } from '../../application/dtos/order/TransitionOrderDto';
import { OperationOrderDto } from '../../application/dtos/order/OperationOrderDto';
import { FindDeliveriesForDelivererDto } from '../../application/dtos/order/FindDeliveriesForDelivererDto';
import { FindNearbyDeliveriesDto } from '../../application/dtos/order/FindNearbyDeliveriesDto';

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
      next(
        error instanceof ApplicationError
          ? error
          : new ApplicationError('Failed to create order', 500, true, [
              { key: 'internal', value: error.message },
            ]),
      );
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
      next(
        error instanceof ApplicationError
          ? error
          : new ApplicationError('Failed to update order', 500, true, [
              { key: 'internal', value: error.message },
            ]),
      );
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
      next(
        error instanceof ApplicationError
          ? error
          : new ApplicationError('Failed to delete order', 500, true, [
              { key: 'internal', value: error.message },
            ]),
      );
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
      next(
        error instanceof ApplicationError
          ? error
          : new ApplicationError('Failed to retrieve order', 500, true, [
              { key: 'internal', value: error.message },
            ]),
      );
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
      next(
        error instanceof ApplicationError
          ? error
          : new ApplicationError('Failed to list orders', 500, true, [
              { key: 'internal', value: error.message },
            ]),
      );
    }
  }

  async markOrderAsWaiting(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const dto: TransitionOrderDto = {
        orderId: req.params.id,
        deliverymanId: req.user.id,
        userRole: req.user.role,
        nextStatus: OrderStatus.AwaitingPickup,
      };
      const orderDto = await this.orderService.markOrderAsWaiting(dto);
      res.status(200).json(orderDto);
    } catch (error: any) {
      next(
        error instanceof ApplicationError
          ? error
          : new ApplicationError('Failed to mark order as waiting', 500, true, [
              { key: 'internal', value: error.message },
            ]),
      );
    }
  }

  async pickupOrder(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const dto: TransitionOrderDto = {
        orderId: req.params.id,
        deliverymanId: req.user.id,
        userRole: req.user.role,
        nextStatus: OrderStatus.PickedUp,
      };
      const orderDto = await this.orderService.pickupOrder(dto);
      res.status(200).json(orderDto);
    } catch (error: any) {
      next(
        error instanceof ApplicationError
          ? error
          : new ApplicationError('Failed to pickup order', 500, true, [
              { key: 'internal', value: error.message },
            ]),
      );
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
      const dto: OperationOrderDto = {
        orderId: req.params.id,
        deliverymanId: req.user.id,
        imageFile: req.file,
      };
      const orderDto = await this.orderService.markOrderAsDelivered(dto);
      res.status(200).json(orderDto);
    } catch (error: any) {
      next(
        error instanceof ApplicationError
          ? error
          : new ApplicationError(
              'Failed to mark order as delivered',
              500,
              true,
              [{ key: 'internal', value: error.message }],
            ),
      );
    }
  }

  async returnOrder(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const dto: TransitionOrderDto = {
        orderId: req.params.id,
        deliverymanId: req.user.id,
        userRole: req.user.role,
        nextStatus: OrderStatus.Returned,
      };
      const orderDto = await this.orderService.returnOrder(dto);
      res.status(200).json(orderDto);
    } catch (error: any) {
      next(
        error instanceof ApplicationError
          ? error
          : new ApplicationError('Failed to return order', 500, true, [
              { key: 'internal', value: error.message },
            ]),
      );
    }
  }

  async listDeliveriesForDeliveryman(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const dto: FindDeliveriesForDelivererDto = {
        deliverymanId: req.params.deliverymanId,
        status: req.query.status as OrderStatus | undefined,
      };
      const ordersDto = await this.orderService.findDeliveriesForDeliverer(dto);
      res.status(200).json(ordersDto);
    } catch (error: any) {
      next(
        error instanceof ApplicationError
          ? error
          : new ApplicationError('Failed to list deliveries', 500, true, [
              { key: 'internal', value: error.message },
            ]),
      );
    }
  }

  async listOwnDeliveries(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const dto: FindDeliveriesForDelivererDto = {
        deliverymanId: req.user.id,
        status: req.query.status as OrderStatus | undefined,
      };
      const ordersDto = await this.orderService.findDeliveriesForDeliverer(dto);
      res.status(200).json(ordersDto);
    } catch (error: any) {
      next(
        error instanceof ApplicationError
          ? error
          : new ApplicationError('Failed to list own deliveries', 500, true, [
              { key: 'internal', value: error.message },
            ]),
      );
    }
  }

  async findNearbyDeliveries(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const dto: FindNearbyDeliveriesDto = {
        deliverymanId: req.user.id,
        zipCode: req.body.zipCode,
      };
      const deliveries = await this.orderService.findNearbyDeliveries(dto);
      res.status(200).json(deliveries);
    } catch (error: any) {
      next(
        error instanceof ApplicationError
          ? error
          : new ApplicationError(
              'Failed to find nearby deliveries',
              500,
              true,
              [{ key: 'internal', value: error.message }],
            ),
      );
    }
  }
}
