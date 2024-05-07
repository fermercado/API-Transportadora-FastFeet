import { Router } from 'express';
import { container } from 'tsyringe';
import { OrderController } from '../controllers/OrderController';
import { AuthMiddleware } from '../../infrastructure/security/AuthMiddleware';
import { validateRequest } from '../../ui/middleware/validateRequest';
import { DeliveryLocationValidator } from '../../domain/validators/DeliveryLocationValidator';

const router = Router();
const orderController = container.resolve(OrderController);

router.get(
  '/api/v1/deliveries',
  AuthMiddleware.verifyToken,
  orderController.listOwnDeliveries.bind(orderController),
);

router.post(
  '/api/v1/deliveries/nearby',
  AuthMiddleware.verifyToken,
  validateRequest(DeliveryLocationValidator.createSchema),
  orderController.findNearbyDeliveries.bind(orderController),
);

export default router;
