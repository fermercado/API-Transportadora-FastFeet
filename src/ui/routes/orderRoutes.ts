import { Router } from 'express';
import { container } from 'tsyringe';
import { OrderController } from '../controllers/OrderController';

const router = Router();

const orderController = container.resolve(OrderController);

router.post('/orders', (req, res) => orderController.createOrder(req, res));

router.get('/orders', (req, res) => orderController.getAllOrders(req, res));

router.get('/orders/:id', (req, res) => orderController.getOrderById(req, res));

router.put('/orders/:id', (req, res) => orderController.updateOrder(req, res));

router.delete('/orders/:id', (req, res) =>
  orderController.deleteOrder(req, res),
);

export default router;
