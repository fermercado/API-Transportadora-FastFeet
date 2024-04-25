import { z } from 'zod';

export const createOrderSchema = z.object({
  recipientId: z.string().uuid({ message: 'Valid recipient ID is required' }),
  deliverymanId: z.string().uuid().optional(),
});

export const updateOrderSchema = z.object({
  recipientId: z.string().uuid().optional(),
  deliverymanId: z.string().uuid().optional(),
  status: z
    .enum(['pending', 'awaiting_pickup', 'delivered', 'returned'])
    .optional(),
  deliveryPhoto: z.string().optional(),
});

export const validateCreateOrder = (data: object) => {
  return createOrderSchema.parse(data);
};

export const validateUpdateOrder = (data: object) => {
  return updateOrderSchema.parse(data);
};
