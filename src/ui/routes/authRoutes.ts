import express from 'express';
import { container } from 'tsyringe';
import { AuthController } from '../controllers/AuthController';

const router = express.Router();
const authController = container.resolve(AuthController);

router.post('/login', (req, res) => authController.login(req, res));

export default router;
