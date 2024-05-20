import 'reflect-metadata';
import { DataSource, Repository } from 'typeorm';
import { Recipient } from '../../../../domain/entities/Recipient';
import { RecipientRepository } from '../../../../infrastructure/orm/repositories/RecipientRepository';

jest.mock('typeorm', () => {
  const actualTypeOrm = jest.requireActual('typeorm');
  return {
    ...actualTypeOrm,
    DataSource: jest.fn(),
    Repository: jest.fn(),
  };
});

describe('RecipientRepository', () => {
  let recipientRepository: RecipientRepository;
  let mockRepository: jest.Mocked<Repository<Recipient>>;
  let mockDataSource: jest.Mocked<DataSource>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
      merge: jest.fn(),
    } as any;

    mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
    } as any;

    recipientRepository = new RecipientRepository(mockDataSource);
  });

  const recipientData: Partial<Recipient> = {
    firstName: 'Maria',
    lastName: 'Silva',
    email: 'maria.silva@example.com',
    cpf: '12345678900',
    zipCode: '12345-678',
    street: 'Street Name',
    number: 123,
    neighborhood: 'Neighborhood',
    city: 'City',
    state: 'State',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should create a recipient', async () => {
    const createdRecipient: Recipient = {
      ...recipientData,
      id: '1',
    } as Recipient;

    mockRepository.create.mockReturnValue(createdRecipient);
    mockRepository.save.mockResolvedValue(createdRecipient);

    const result = await recipientRepository.create(recipientData);

    expect(mockRepository.create).toHaveBeenCalledWith(recipientData);
    expect(mockRepository.save).toHaveBeenCalledWith(createdRecipient);
    expect(result).toEqual(createdRecipient);
  });

  it('should update a recipient', async () => {
    const recipient: Recipient = {
      id: '1',
      ...recipientData,
    } as Recipient;
    const updatedRecipient: Recipient = {
      ...recipient,
      firstName: 'Updated Name',
    };

    mockRepository.findOneBy.mockResolvedValue(recipient);
    mockRepository.merge.mockReturnValue(updatedRecipient);
    mockRepository.save.mockResolvedValue(updatedRecipient);

    const result = await recipientRepository.update('1', {
      firstName: 'Updated Name',
    });

    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
    expect(mockRepository.merge).toHaveBeenCalledWith(recipient, {
      firstName: 'Updated Name',
    });
    expect(mockRepository.save).toHaveBeenCalledWith(updatedRecipient);
    expect(result).toEqual(updatedRecipient);
  });

  it('should throw an error if recipient not found on update', async () => {
    mockRepository.findOneBy.mockResolvedValue(undefined as any);

    await expect(
      recipientRepository.update('1', { firstName: 'Updated Name' }),
    ).rejects.toThrow('Recipient with id 1 not found');
  });

  it('should find a recipient by ID', async () => {
    const recipient: Recipient = {
      id: '1',
      ...recipientData,
    } as Recipient;

    mockRepository.findOneBy.mockResolvedValue(recipient);

    const result = await recipientRepository.findById('1');

    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
    expect(result).toEqual(recipient);
  });

  it('should return undefined if recipient not found by ID', async () => {
    mockRepository.findOneBy.mockResolvedValue(undefined as any);

    const result = await recipientRepository.findById('1');

    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
    expect(result).toBeUndefined();
  });

  it('should find a recipient by email', async () => {
    const recipient: Recipient = {
      id: '1',
      ...recipientData,
    } as Recipient;

    mockRepository.findOneBy.mockResolvedValue(recipient);

    const result = await recipientRepository.findByEmail(
      'maria.silva@example.com',
    );

    expect(mockRepository.findOneBy).toHaveBeenCalledWith({
      email: 'maria.silva@example.com',
    });
    expect(result).toEqual(recipient);
  });

  it('should return undefined if recipient not found by email', async () => {
    mockRepository.findOneBy.mockResolvedValue(undefined as any);

    const result = await recipientRepository.findByEmail(
      'maria.silva@example.com',
    );

    expect(mockRepository.findOneBy).toHaveBeenCalledWith({
      email: 'maria.silva@example.com',
    });
    expect(result).toBeUndefined();
  });

  it('should find a recipient by CPF', async () => {
    const recipient: Recipient = {
      id: '1',
      ...recipientData,
    } as Recipient;

    mockRepository.findOneBy.mockResolvedValue(recipient);

    const result = await recipientRepository.findByCpf('12345678900');

    expect(mockRepository.findOneBy).toHaveBeenCalledWith({
      cpf: '12345678900',
    });
    expect(result).toEqual(recipient);
  });

  it('should return undefined if recipient not found by CPF', async () => {
    mockRepository.findOneBy.mockResolvedValue(undefined as any);

    const result = await recipientRepository.findByCpf('12345678900');

    expect(mockRepository.findOneBy).toHaveBeenCalledWith({
      cpf: '12345678900',
    });
    expect(result).toBeUndefined();
  });

  it('should find a recipient by zip code', async () => {
    const recipient: Recipient = {
      id: '1',
      ...recipientData,
    } as Recipient;

    mockRepository.findOneBy.mockResolvedValue(recipient);

    const result = await recipientRepository.findByZipCode('12345-678');

    expect(mockRepository.findOneBy).toHaveBeenCalledWith({
      zipCode: '12345-678',
    });
    expect(result).toEqual(recipient);
  });

  it('should return undefined if recipient not found by zip code', async () => {
    mockRepository.findOneBy.mockResolvedValue(undefined as any);

    const result = await recipientRepository.findByZipCode('12345-678');

    expect(mockRepository.findOneBy).toHaveBeenCalledWith({
      zipCode: '12345-678',
    });
    expect(result).toBeUndefined();
  });

  it('should find all recipients', async () => {
    const recipients: Recipient[] = [
      {
        id: '1',
        ...recipientData,
      } as Recipient,
    ];

    mockRepository.find.mockResolvedValue(recipients);

    const result = await recipientRepository.find();

    expect(mockRepository.find).toHaveBeenCalled();
    expect(result).toEqual(recipients);
  });

  it('should save a recipient', async () => {
    const recipient: Recipient = {
      id: '1',
      ...recipientData,
    } as Recipient;

    mockRepository.save.mockResolvedValue(recipient);

    const result = await recipientRepository.save(recipient);

    expect(mockRepository.save).toHaveBeenCalledWith(recipient);
    expect(result).toEqual(recipient);
  });

  it('should remove a recipient', async () => {
    const recipient: Recipient = {
      id: '1',
      ...recipientData,
    } as Recipient;

    mockRepository.remove.mockResolvedValue(undefined as any);

    await recipientRepository.remove(recipient);

    expect(mockRepository.remove).toHaveBeenCalledWith(recipient);
  });
});
