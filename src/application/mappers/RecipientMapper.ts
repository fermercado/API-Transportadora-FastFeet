import { Recipient } from '../../domain/entities/Recipient';
import { RecipientResponseDto } from '../../application/dtos/recipient/ResponseRecipientDto';
import { injectable } from 'tsyringe';

@injectable()
export class RecipientMapper {
  public toDto(recipient: Recipient): RecipientResponseDto {
    return {
      id: recipient.id,
      firstName: recipient.firstName,
      lastName: recipient.lastName,
      street: recipient.street,
      number: recipient.number,
      cpf: recipient.cpf,
      complement: recipient.complement,
      neighborhood: recipient.neighborhood,
      city: recipient.city,
      state: recipient.state,
      zipCode: recipient.zipCode,
      email: recipient.email,
      latitude: recipient.latitude,
      longitude: recipient.longitude,
    };
  }
}
