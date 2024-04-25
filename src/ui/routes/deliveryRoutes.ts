import { Router } from 'express';
import { container } from 'tsyringe';
import { OrderController } from '../controllers/OrderController';
import { AuthMiddleware } from '../../infrastructure/security/AuthMiddleware';
import { validateRequest } from '../../ui/middleware/validateRequest';
import { DeliveryLocationValidator } from '../../domain/validators/DeliveryLocationValidator';

const router = Router();
const orderController = container.resolve(OrderController);

router.use(AuthMiddleware.verifyToken);

router
  .route('/api/v1/deliveries')
  .get(orderController.listDeliveriesForDeliveryman.bind(orderController));

router.post(
  '/api/v1/deliveries/nearby',
  validateRequest(DeliveryLocationValidator.createSchema),
  orderController.findNearbyDeliveries.bind(orderController),
);

export default router;
