import express, { Express } from 'express';
import cors from 'cors';
import userRoutes from './ui/routes/userRoutes';
import recipientRoutes from './ui/routes/recipientRoutes';
import orderRoutes from './ui/routes/orderRoutes';
import deliveryRoutes from './ui/routes/deliveryRoutes';
import authRoutes from './ui/routes/authRoutes';
import { errorHandler } from './ui/middleware/ErrorHandler';
import setupSwagger from './swagger';

export function createApp(): Express {
  const app = express();

  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  app.use(express.json());

  app.get('/', (_req, res) => {
    res.redirect('/api-docs/#/');
  });

  setupSwagger(app);

  app.use(authRoutes);
  app.use(userRoutes);
  app.use(recipientRoutes);
  app.use(orderRoutes);
  app.use(deliveryRoutes);

  app.use(errorHandler);

  return app;
}
