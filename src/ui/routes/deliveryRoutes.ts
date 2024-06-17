import { Router } from 'express';
import { container } from 'tsyringe';
import { OrderController } from '../controllers/OrderController';
import { AuthMiddleware } from '../../infrastructure/security/AuthMiddleware';
import { validateRequest } from '../../ui/middleware/validateRequest';
import { DeliveryLocationValidator } from '../../domain/validators/DeliveryLocationValidator';
import { CepValidationProvider } from '../../infrastructure/providers/CepValidationProvider';

const router = Router();
const orderController = container.resolve(OrderController);
const cepValidationProvider = container.resolve(CepValidationProvider);

router.get(
  '/api/v1/deliveries',
  AuthMiddleware.verifyToken,
  orderController.listOwnDeliveries.bind(orderController),
);

router.post(
  '/api/v1/deliveries/nearby',
  AuthMiddleware.verifyToken,
  validateRequest(
    DeliveryLocationValidator.createSchema(cepValidationProvider),
  ),
  orderController.findNearbyDeliveries.bind(orderController),
);

export default router;
