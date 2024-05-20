import { Router } from 'express';
import { container } from 'tsyringe';
import { UserController } from '../controllers/UserController';
import { validateRequest } from '../../ui/middleware/validateRequest';
import { UserValidator } from '../../domain/validators/UserValidator';
import { AdminOnlyMiddleware } from '../../infrastructure/security/adminOnlyMiddleware';
import { AuthMiddleware } from '../../infrastructure/security/AuthMiddleware';

const router = Router();
const userController = container.resolve(UserController);

router
  .route('/api/v1/users')
  .get(
    AuthMiddleware.verifyToken,
    AdminOnlyMiddleware.checkAdminRole,
    userController.getAllUsers.bind(userController),
  )
  .post(
    AuthMiddleware.verifyToken,
    AdminOnlyMiddleware.checkAdminRole,
    validateRequest(UserValidator.validateCreateUser),
    userController.createUser.bind(userController),
  );

router
  .route('/api/v1/users/:id')
  .get(
    AuthMiddleware.verifyToken,
    AdminOnlyMiddleware.checkAdminRole,
    userController.getUserById.bind(userController),
  )
  .put(
    AuthMiddleware.verifyToken,
    AdminOnlyMiddleware.checkAdminRole,
    validateRequest(UserValidator.validateUpdateUser),
    userController.updateUser.bind(userController),
  )
  .delete(
    AuthMiddleware.verifyToken,
    AdminOnlyMiddleware.checkAdminRole,
    userController.deleteUser.bind(userController),
  );

export default router;
