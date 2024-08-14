import { Router } from 'express';
import { container } from 'tsyringe';
import { OrderController } from '../controllers/OrderController';

const orderController = container.resolve(OrderController);

const routes = Router();

routes.get(
  '/api/v1/orders/track',
  orderController.getOrderStatusByTracking.bind(orderController),
);

export default routes;
