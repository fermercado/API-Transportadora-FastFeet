import { Router } from 'express';
import { container } from 'tsyringe';
import { RecipientController } from '../controllers/RecipientController';

const router = Router();
const recipientController = container.resolve(RecipientController);

router.post('/recipients', (req, res) =>
  recipientController.createRecipient(req, res),
);
router.put('/recipients/:id', (req, res) =>
  recipientController.updateRecipient(req, res),
);
router.delete('/recipients/:id', (req, res) =>
  recipientController.deleteRecipient(req, res),
);
router.get('/recipients/:id', (req, res) =>
  recipientController.getRecipientById(req, res),
);
router.get('/recipients', (req, res) =>
  recipientController.getAllRecipients(req, res),
);

export default router;
