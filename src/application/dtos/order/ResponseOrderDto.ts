import { RecipientResponseDto } from '../recipient/ResponseRecipientDto';
import { ResponseUserDto } from '../user/ResponseUserDto';

export class OrderResponseDto {
  id!: string;
  trackingCode!: string;
  status!: string;
  deliveryPhoto?: string;
  createdAt!: Date;
  updatedAt!: Date;
  recipient?: RecipientResponseDto;
  deliveryman?: ResponseUserDto;
}
