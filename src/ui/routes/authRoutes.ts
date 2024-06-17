import { Router } from 'express';
import { container } from 'tsyringe';
import { AuthController } from '../controllers/AuthController';

const router = Router();
const authController = container.resolve(AuthController);

router.post('/api/v1/login', (req, res, next) =>
  authController.login(req, res, next),
);

export default router;
