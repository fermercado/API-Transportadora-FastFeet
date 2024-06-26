import { Router } from 'express';
import { container } from 'tsyringe';
import { RecipientController } from '../controllers/RecipientController';
import { AuthMiddleware } from '../../infrastructure/security/AuthMiddleware';
import { AdminOnlyMiddleware } from '../../infrastructure/security/adminOnlyMiddleware';
import { validateRequest } from '../../ui/middleware/validateRequest';
import { RecipientValidator } from '../../domain/validators/RecipientValidator';
import { CepValidationProvider } from '../../infrastructure/providers/CepValidationProvider';

const router = Router();
const recipientController = container.resolve(RecipientController);
const cepValidationProvider = container.resolve(CepValidationProvider);

router.post(
  '/api/v1/recipients',
  AuthMiddleware.verifyToken,
  AdminOnlyMiddleware.checkAdminRole,
  validateRequest(RecipientValidator.createSchema(cepValidationProvider)),
  recipientController.createRecipient.bind(recipientController),
);

router.put(
  '/api/v1/recipients/:id',
  AuthMiddleware.verifyToken,
  AdminOnlyMiddleware.checkAdminRole,
  validateRequest(RecipientValidator.updateSchema(cepValidationProvider)),
  recipientController.updateRecipient.bind(recipientController),
);

router.delete(
  '/api/v1/recipients/:id',
  AuthMiddleware.verifyToken,
  AdminOnlyMiddleware.checkAdminRole,
  recipientController.deleteRecipient.bind(recipientController),
);

router.get(
  '/api/v1/recipients/:id',
  AuthMiddleware.verifyToken,
  AdminOnlyMiddleware.checkAdminRole,
  recipientController.getRecipientById.bind(recipientController),
);

router.get(
  '/api/v1/recipients',
  AuthMiddleware.verifyToken,
  AdminOnlyMiddleware.checkAdminRole,
  recipientController.getAllRecipients.bind(recipientController),
);

export default router;
