import express, { Express } from 'express';
import userRoutes from './ui/routes/userRoutes';
import recipientRoutes from './ui/routes/recipientRoutes';
import orderRoutes from './ui/routes/orderRoutes';
import deliverymanRoutes from './ui/routes/deliverymanRoutes';
import authRoutes from './ui/routes/authRoutes';

export function createApp(): Express {
  const app = express();
  app.use(express.json());

  app.use(userRoutes);
  app.use(recipientRoutes);
  app.use(orderRoutes);
  app.use(deliverymanRoutes);
  app.use(authRoutes);

  return app;
}
