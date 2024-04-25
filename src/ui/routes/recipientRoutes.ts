import { Router } from 'express';
import { container } from 'tsyringe';
import { RecipientController } from '../controllers/RecipientController';
import { AuthMiddleware } from '../../infrastructure/security/AuthMiddleware';
import { AdminOnlyMiddleware } from '../../infrastructure/security/adminOnlyMiddleware';
import { validateRequest } from '../../ui/middleware/validateRequest';
import { RecipientValidator } from '../../domain/validators/RecipientValidator';

const router = Router();
const recipientController = container.resolve(RecipientController);

router.post(
  '/api/v1/recipients',
  AuthMiddleware.verifyToken,
  AdminOnlyMiddleware.checkAdminRole,
  validateRequest(RecipientValidator.createSchema),
  (req, res, next) => recipientController.createRecipient(req, res, next),
);

router.put(
  '/api/v1/recipients/:id',
  AuthMiddleware.verifyToken,
  AdminOnlyMiddleware.checkAdminRole,
  validateRequest(RecipientValidator.updateSchema),
  (req, res, next) => recipientController.updateRecipient(req, res, next),
);

router.delete(
  '/api/v1/recipients/:id',
  AuthMiddleware.verifyToken,
  AdminOnlyMiddleware.checkAdminRole,
  (req, res, next) => recipientController.deleteRecipient(req, res, next),
);

router.get(
  '/api/v1/recipients/:id',
  AuthMiddleware.verifyToken,
  AdminOnlyMiddleware.checkAdminRole,
  (req, res, next) => recipientController.getRecipientById(req, res, next),
);

router.get(
  '/api/v1/recipients',
  AuthMiddleware.verifyToken,
  AdminOnlyMiddleware.checkAdminRole,
  (req, res, next) => recipientController.getAllRecipients(req, res, next),
);

export default router;
