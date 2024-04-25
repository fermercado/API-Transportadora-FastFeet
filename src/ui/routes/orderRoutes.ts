import { Router } from 'express';
import { container } from 'tsyringe';
import { OrderController } from '../controllers/OrderController';
import { validateRequest } from '../../ui/middleware/validateRequest';
import { adminOnlyMiddleware } from '../../infrastructure/security/adminOnlyMiddleware';
import { AuthMiddleware } from '../../infrastructure/security/AuthMiddleware';
import { upload } from '../../infrastructure/config/multerConfig';
import {
  createOrderSchema,
  updateOrderSchema,
} from '../../domain/validators/OrderValidator';

const router = Router();
const orderController = container.resolve(OrderController);

router
  .route('/api/v1/orders')
  .get(
    AuthMiddleware,
    adminOnlyMiddleware,
    orderController.listOrders.bind(orderController),
  )
  .post(
    AuthMiddleware,
    adminOnlyMiddleware,
    validateRequest(createOrderSchema),
    orderController.createOrder.bind(orderController),
  );

router
  .route('/api/v1/orders/:id')
  .get(AuthMiddleware, orderController.getOrderById.bind(orderController))
  .put(
    AuthMiddleware,
    adminOnlyMiddleware,
    validateRequest(updateOrderSchema),
    orderController.updateOrder.bind(orderController),
  )
  .delete(
    AuthMiddleware,
    adminOnlyMiddleware,
    orderController.deleteOrder.bind(orderController),
  );

router.put(
  '/api/v1/orders/:id/waiting',
  AuthMiddleware,
  orderController.markOrderAsWaiting.bind(orderController),
);
router.put(
  '/api/v1/orders/:id/pickup',
  AuthMiddleware,
  orderController.pickupOrder.bind(orderController),
);
router.put(
  '/api/v1/orders/:id/delivered',
  AuthMiddleware,
  upload.single('deliveryPhoto'),
  orderController.markOrderAsDelivered.bind(orderController),
);
router.put(
  '/api/v1/orders/:id/returned',
  AuthMiddleware,
  orderController.returnOrder.bind(orderController),
);

export default router;
