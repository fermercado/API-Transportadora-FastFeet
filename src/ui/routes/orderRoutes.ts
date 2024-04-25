import { Router } from 'express';
import { container } from 'tsyringe';
import { OrderController } from '../controllers/OrderController';
import { validateRequest } from '../../ui/middleware/validateRequest';
import { AdminOnlyMiddleware } from '../../infrastructure/security/adminOnlyMiddleware';
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
    AuthMiddleware.verifyToken,
    AdminOnlyMiddleware.checkAdminRole,
    orderController.listOrders.bind(orderController),
  )
  .post(
    AuthMiddleware.verifyToken,
    AdminOnlyMiddleware.checkAdminRole,
    validateRequest(createOrderSchema),
    orderController.createOrder.bind(orderController),
  );

router
  .route('/api/v1/orders/:id')
  .get(
    AuthMiddleware.verifyToken,
    orderController.getOrderById.bind(orderController),
  )
  .put(
    AuthMiddleware.verifyToken,
    AdminOnlyMiddleware.checkAdminRole,
    validateRequest(updateOrderSchema),
    orderController.updateOrder.bind(orderController),
  )
  .delete(
    AuthMiddleware.verifyToken,
    AdminOnlyMiddleware.checkAdminRole,
    orderController.deleteOrder.bind(orderController),
  );

router.put(
  '/api/v1/orders/:id/waiting',
  AuthMiddleware.verifyToken,
  orderController.markOrderAsWaiting.bind(orderController),
);
router.put(
  '/api/v1/orders/:id/pickup',
  AuthMiddleware.verifyToken,
  orderController.pickupOrder.bind(orderController),
);
router.put(
  '/api/v1/orders/:id/delivered',
  AuthMiddleware.verifyToken,
  upload.single('deliveryPhoto'),
  orderController.markOrderAsDelivered.bind(orderController),
);
router.put(
  '/api/v1/orders/:id/returned',
  AuthMiddleware.verifyToken,
  orderController.returnOrder.bind(orderController),
);

export default router;
