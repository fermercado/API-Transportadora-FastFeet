import { RecipientResponseDto } from '../recipient/ResponseRecipientDto';
import { ResponseUserDto } from '../user/ResponseUserDto';

export class OrderResponseDto {
  id!: string;
  trackingCode!: string;
  status!: string;
  deliveryPhoto?: string;
  recipient?: RecipientResponseDto;
  deliveryman?: ResponseUserDto;
  createdAt!: string;
  updatedAt!: string;
  awaitingPickupAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  returnedAt?: string;
}
