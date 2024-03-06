import { Router } from 'express';
import { container } from 'tsyringe';
import { RecipientController } from '../controllers/RecipientController';
import { adminOnlyMiddleware } from '../../infrastructure/security/adminOnlyMiddleware';
import { AuthMiddleware } from '../../infrastructure/security/AuthMiddleware';
import { validateRequest } from '../../ui/middleware/validateRequest';
import { RecipientValidator } from '../../domain/validators/RecipientValidator';

const router = Router();
const recipientController = container.resolve(RecipientController);

router.post(
  '/recipients',
  AuthMiddleware,
  adminOnlyMiddleware,
  validateRequest(RecipientValidator.createSchema),
  (req, res, next) => recipientController.createRecipient(req, res, next),
);

router.put(
  '/recipients/:id',
  AuthMiddleware,
  adminOnlyMiddleware,
  validateRequest(RecipientValidator.updateSchema),
  (req, res, next) => recipientController.updateRecipient(req, res, next),
);

router.delete(
  '/recipients/:id',
  AuthMiddleware,
  adminOnlyMiddleware,
  (req, res, next) => recipientController.deleteRecipient(req, res, next),
);

router.get(
  '/recipients/:id',
  AuthMiddleware,
  adminOnlyMiddleware,
  (req, res, next) => recipientController.getRecipientById(req, res, next),
);

router.get(
  '/recipients',
  AuthMiddleware,
  adminOnlyMiddleware,
  (req, res, next) => recipientController.getAllRecipients(req, res, next),
);

export default router;
