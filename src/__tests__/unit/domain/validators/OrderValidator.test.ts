import OrderValidator from '../../../../domain/validators/OrderValidator';
import { z } from 'zod';

describe('OrderValidator', () => {
  describe('createOrderSchema', () => {
    it('should pass validation for a valid order', async () => {
      const validOrder = {
        recipientId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        deliverymanId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      };

      await expect(
        OrderValidator.createOrderSchema.parseAsync(validOrder),
      ).resolves.not.toThrow();
    });

    it('should fail validation for an invalid recipientId', async () => {
      const invalidOrder = {
        recipientId: 'invalid-uuid',
        deliverymanId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      };

      await expect(
        OrderValidator.createOrderSchema.parseAsync(invalidOrder),
      ).rejects.toThrow(z.ZodError);
    });

    it('should pass validation if deliverymanId is omitted', async () => {
      const validOrder = {
        recipientId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      };

      await expect(
        OrderValidator.createOrderSchema.parseAsync(validOrder),
      ).resolves.not.toThrow();
    });

    it('should fail validation for an invalid deliverymanId', async () => {
      const invalidOrder = {
        recipientId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        deliverymanId: 'invalid-uuid',
      };

      await expect(
        OrderValidator.createOrderSchema.parseAsync(invalidOrder),
      ).rejects.toThrow(z.ZodError);
    });
  });

  describe('updateOrderSchema', () => {
    it('should pass validation for a valid order update', async () => {
      const validOrderUpdate = {
        recipientId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        deliverymanId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        status: 'delivered',
        deliveryPhoto: 'photo_url',
      };

      await expect(
        OrderValidator.updateOrderSchema.parseAsync(validOrderUpdate),
      ).resolves.not.toThrow();
    });

    it('should fail validation for an invalid status', async () => {
      const invalidOrderUpdate = {
        recipientId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        deliverymanId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        status: 'invalid_status',
        deliveryPhoto: 'photo_url',
      };

      await expect(
        OrderValidator.updateOrderSchema.parseAsync(invalidOrderUpdate),
      ).rejects.toThrow(z.ZodError);
    });

    it('should pass validation if some fields are omitted', async () => {
      const validOrderUpdate = {
        status: 'awaiting_pickup',
      };

      await expect(
        OrderValidator.updateOrderSchema.parseAsync(validOrderUpdate),
      ).resolves.not.toThrow();
    });

    it('should fail validation for an invalid recipientId', async () => {
      const invalidOrderUpdate = {
        recipientId: 'invalid-uuid',
        deliverymanId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        status: 'delivered',
        deliveryPhoto: 'photo_url',
      };

      await expect(
        OrderValidator.updateOrderSchema.parseAsync(invalidOrderUpdate),
      ).rejects.toThrow(z.ZodError);
    });

    it('should fail validation for an invalid deliverymanId', async () => {
      const invalidOrderUpdate = {
        recipientId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        deliverymanId: 'invalid-uuid',
        status: 'delivered',
        deliveryPhoto: 'photo_url',
      };

      await expect(
        OrderValidator.updateOrderSchema.parseAsync(invalidOrderUpdate),
      ).rejects.toThrow(z.ZodError);
    });
  });
});
