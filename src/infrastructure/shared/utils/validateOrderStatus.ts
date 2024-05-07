import { OrderStatus } from '../../../domain/enums/OrderStatus';
import { ParsedQs } from 'qs';
export class OrderStatusValidator {
  /**
   *
   * @param status
   * @returns
   */
  public static validate(
    status: string | ParsedQs | string[] | ParsedQs[] | undefined,
  ): OrderStatus | undefined {
    if (
      typeof status === 'string' &&
      Object.values(OrderStatus).includes(status as OrderStatus)
    ) {
      return status as OrderStatus;
    }
    return undefined;
  }
}
