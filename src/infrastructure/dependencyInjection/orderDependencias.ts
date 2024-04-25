import { container } from 'tsyringe';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { OrderRepository } from '../../infrastructure/repositories/OrderRepository';
import { OrderService } from '../../application/services/OrderService';
import { OrderValidationService } from '../../application/validation/OrderValidationService';

container.registerSingleton<IOrderRepository>(
  'IOrderRepository',
  OrderRepository,
);
container.registerSingleton<OrderService>('OrderService', OrderService);
container.registerSingleton<OrderValidationService>(
  'OrderValidationService',
  OrderValidationService,
);

export { container } from 'tsyringe';
