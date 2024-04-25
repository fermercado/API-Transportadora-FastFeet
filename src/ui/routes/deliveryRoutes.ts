import { Router } from 'express';
import { container } from 'tsyringe';
import { OrderController } from '../controllers/OrderController';
import { AuthMiddleware } from '../../infrastructure/security/AuthMiddleware';
import { validateRequest } from '../../ui/middleware/validateRequest';
import { DeliveryLocationValidator } from '../../domain/validators/DeliveryLocationValidator';

const deliveryRouter = Router();
const orderController = container.resolve(OrderController);

deliveryRouter.use(AuthMiddleware);

deliveryRouter
  .route('/api/v1/deliveries')
  .get(orderController.listDeliveriesForDeliveryman.bind(orderController));

deliveryRouter.post(
  '/api/v1/deliveries/nearby',
  validateRequest(DeliveryLocationValidator.createSchema),
  orderController.findNearbyDeliveries.bind(orderController),
);

export default deliveryRouter;
