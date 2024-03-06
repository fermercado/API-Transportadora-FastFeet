import { Router } from 'express';
import { container } from 'tsyringe';
import { UserController } from '../controllers/UserController';
import { validateRequest } from '../../ui/middleware/validateRequest';
import UserValidator from '../../domain/validators/UserValidator';
import { adminOnlyMiddleware } from '../../infrastructure/security/adminOnlyMiddleware';
import { AuthMiddleware } from '../../infrastructure/security/AuthMiddleware';

const router = Router();
const userController = container.resolve(UserController);

router
  .route('/users')
  .get(
    AuthMiddleware,
    adminOnlyMiddleware,
    userController.getAllUsers.bind(userController),
  )
  .post(
    AuthMiddleware,
    adminOnlyMiddleware,
    validateRequest(UserValidator.validateCreateUser),
    userController.createUser.bind(userController),
  );

router
  .route('/users/:id')
  .get(
    AuthMiddleware,
    adminOnlyMiddleware,
    userController.getUserById.bind(userController),
  )
  .put(
    AuthMiddleware,
    adminOnlyMiddleware,
    validateRequest(UserValidator.validateUpdateUser),
    userController.updateUser.bind(userController),
  )
  .delete(
    AuthMiddleware,
    adminOnlyMiddleware,
    userController.deleteUser.bind(userController),
  );

export default router;
