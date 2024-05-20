import { Recipient } from '../../../../domain/entities/Recipient';
import { RecipientResponseDto } from '../../../../application/dtos/recipient/ResponseRecipientDto';
import { RecipientMapper } from '../../../../application/mappers/RecipientMapper';

describe('RecipientMapper', () => {
  let recipientMapper: RecipientMapper;

  beforeEach(() => {
    recipientMapper = new RecipientMapper();
  });

  it('should map Recipient to RecipientResponseDto correctly', () => {
    const recipient = new Recipient();
    recipient.id = '1';
    recipient.firstName = 'Maria';
    recipient.lastName = 'Silva';
    recipient.street = 'Main St';
    recipient.number = 123;
    recipient.cpf = '123.456.789-00';
    recipient.complement = 'Apt 4B';
    recipient.neighborhood = 'Downtown';
    recipient.city = 'Metropolis';
    recipient.state = 'NY';
    recipient.zipCode = '12345-678';
    recipient.email = 'maria.silva@example.com';
    recipient.latitude = 40.7128;
    recipient.longitude = -74.006;

    const recipientResponseDto: RecipientResponseDto =
      recipientMapper.toDto(recipient);

    expect(recipientResponseDto).toEqual({
      id: '1',
      firstName: 'Maria',
      lastName: 'Silva',
      street: 'Main St',
      number: 123,
      cpf: '123.456.789-00',
      complement: 'Apt 4B',
      neighborhood: 'Downtown',
      city: 'Metropolis',
      state: 'NY',
      zipCode: '12345-678',
      email: 'maria.silva@example.com',
      latitude: 40.7128,
      longitude: -74.006,
    });
  });
});
