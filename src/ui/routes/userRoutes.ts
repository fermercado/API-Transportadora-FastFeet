import { Router } from 'express';
import { container } from 'tsyringe';
import { UserController } from '../controllers/UserController';
import AuthMiddleware from '../../infrastructure/security/AuthMiddleware';

const router = Router();

const userController = container.resolve(UserController);

router.post('/users', (req, res) => userController.createUser(req, res));
router.put('/users/:id', (req, res) => userController.updateUser(req, res));
router.delete('/users/:id', (req, res) => userController.deleteUser(req, res));
router.get('/users/:id', (req, res) => userController.getUserById(req, res));
router.get('/users', AuthMiddleware, (req, res) =>
  userController.getAllUsers(req, res),
);

export default router;
