import { OrderStatusValidator } from '../../../../infrastructure/shared/utils/validateOrderStatus';
import { OrderStatus } from '../../../../domain/enums/OrderStatus';

describe('OrderStatusValidator', () => {
  it('should return the status if it is a valid OrderStatus value', () => {
    const validStatus = OrderStatus.Pending;
    const result = OrderStatusValidator.validate(validStatus);
    expect(result).toBe(validStatus);
  });

  it('should return undefined for an invalid order status', () => {
    const invalidStatus = 'NotAStatus';
    const result = OrderStatusValidator.validate(invalidStatus);
    expect(result).toBeUndefined();
  });

  it('should return undefined if status is not a string', () => {
    const numberStatus = 123;
    const result = OrderStatusValidator.validate(numberStatus as any);
    expect(result).toBeUndefined();
  });

  it('should return undefined if status is undefined', () => {
    const undefinedStatus = undefined;
    const result = OrderStatusValidator.validate(undefinedStatus);
    expect(result).toBeUndefined();
  });
});
