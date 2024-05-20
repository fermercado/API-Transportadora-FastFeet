import { Router, Express } from 'express';
import { container } from 'tsyringe';
import { AuthController } from '../controllers/AuthController';

const router = Router();
const authController = container.resolve(AuthController);

router.post('/api/v1/login', (req, res) => authController.login(req, res));

export default router;

export function setupAuthRoutes(app: Express): void {
  app.use(router);
}
