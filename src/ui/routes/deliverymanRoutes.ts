import { Router } from 'express';
import { container } from 'tsyringe';
import { DeliverymanController } from '../controllers/DeliverymanController';

const router = Router();

const deliverymanController = container.resolve(DeliverymanController);

router.post('/deliveryman', (req, res) =>
  deliverymanController.createDeliveryman(req, res),
);

router.get('/deliveryman', (req, res) =>
  deliverymanController.getAllDeliverymen(req, res),
);

router.get('/deliveryman/:id', (req, res) =>
  deliverymanController.getDeliverymanById(req, res),
);

router.put('/deliveryman/:id', (req, res) =>
  deliverymanController.updateDeliveryman(req, res),
);

router.delete('/deliveryman/:id', (req, res) =>
  deliverymanController.deleteDeliveryman(req, res),
);

export default router;
