import { z } from 'zod';

class OrderValidator {
  static createOrderSchema = z.object({
    recipientId: z.string().uuid({ message: 'Valid recipient ID is required' }),
    deliverymanId: z.string().uuid().optional(),
  });

  static updateOrderSchema = z
    .object({
      recipientId: z.string().uuid(),
      deliverymanId: z.string().uuid(),
      status: z.enum(['pending', 'awaiting_pickup', 'delivered', 'returned']),
      deliveryPhoto: z.string(),
    })
    .partial();
}

export default OrderValidator;
