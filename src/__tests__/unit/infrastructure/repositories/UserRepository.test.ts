import 'reflect-metadata';
import { DataSource, Repository } from 'typeorm';
import { User } from '../../../../domain/entities/User';
import { UserRepository } from '../../../../infrastructure/orm/repositories/UserRepository';
import { UserFilter } from '../../../../domain/interface/UserFilter';
import { UserRole } from '../../../../domain/enums/UserRole';

jest.mock('typeorm', () => {
  const actualTypeOrm = jest.requireActual('typeorm');
  return {
    ...actualTypeOrm,
    DataSource: jest.fn(),
    Repository: jest.fn(),
  };
});

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let mockRepository: jest.Mocked<Repository<User>>;
  let mockDataSource: jest.Mocked<DataSource>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
    } as any;

    userRepository = new UserRepository(mockDataSource);
  });

  it('should create a user', async () => {
    const userData: Partial<User> = {
      firstName: 'João',
      lastName: 'Silva',
      email: 'joao.silva@example.com',
      cpf: '12345678900',
      password: 'password',
      role: UserRole.Deliveryman,
    };
    const createdUser: User = {
      ...userData,
      id: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;

    mockRepository.create.mockReturnValue(createdUser);
    mockRepository.save.mockResolvedValue(createdUser);

    const result = await userRepository.create(userData);

    expect(mockRepository.create).toHaveBeenCalledWith(userData);
    expect(mockRepository.save).toHaveBeenCalledWith(createdUser);
    expect(result).toEqual(createdUser);
  });

  it('should update a user', async () => {
    const userData: Partial<User> = { firstName: 'João' };
    const user: User = {
      id: '1',
      firstName: 'Old Name',
      lastName: 'Silva',
      email: 'old@example.com',
      cpf: '12345678900',
      password: 'oldpass',
      role: UserRole.Deliveryman,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updatedUser: User = { ...user, ...userData };

    mockRepository.findOneBy.mockResolvedValue(user);
    mockRepository.save.mockResolvedValue(updatedUser);

    const result = await userRepository.update('1', userData);

    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
    expect(mockRepository.save).toHaveBeenCalledWith(updatedUser);
    expect(result).toEqual(updatedUser);
  });

  it('should throw an error if user not found on update', async () => {
    const userData: Partial<User> = { firstName: 'João' };

    mockRepository.findOneBy.mockResolvedValue(undefined as any);

    await expect(userRepository.update('1', userData)).rejects.toThrow(
      'User not found',
    );
  });

  it('should find a user by ID', async () => {
    const user: User = {
      id: '1',
      firstName: 'João',
      lastName: 'Silva',
      email: 'joao.silva@example.com',
      cpf: '12345678900',
      password: 'password',
      role: UserRole.Deliveryman,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockRepository.findOneBy.mockResolvedValue(user);

    const result = await userRepository.findById('1');

    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
    expect(result).toEqual(user);
  });

  it('should return undefined if user not found by ID', async () => {
    mockRepository.findOneBy.mockResolvedValue(undefined as any);

    const result = await userRepository.findById('1');

    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
    expect(result).toBeUndefined();
  });

  it('should find a user by CPF', async () => {
    const user: User = {
      id: '1',
      cpf: '12345678900',
      firstName: 'João',
      lastName: 'Silva',
      email: 'joao.silva@example.com',
      password: 'password',
      role: UserRole.Deliveryman,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockRepository.findOneBy.mockResolvedValue(user);

    const result = await userRepository.findByCpf('12345678900');

    expect(mockRepository.findOneBy).toHaveBeenCalledWith({
      cpf: '12345678900',
    });
    expect(result).toEqual(user);
  });

  it('should return undefined if user not found by CPF', async () => {
    mockRepository.findOneBy.mockResolvedValue(undefined as any);

    const result = await userRepository.findByCpf('12345678900');

    expect(mockRepository.findOneBy).toHaveBeenCalledWith({
      cpf: '12345678900',
    });
    expect(result).toBeUndefined();
  });

  it('should find a user by email', async () => {
    const user: User = {
      id: '1',
      email: 'joao.silva@example.com',
      firstName: 'João',
      lastName: 'Silva',
      cpf: '12345678900',
      password: 'password',
      role: UserRole.Deliveryman,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockRepository.findOne.mockResolvedValue(user);

    const result = await userRepository.findByEmail('joao.silva@example.com');

    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { email: 'joao.silva@example.com' },
    });
    expect(result).toEqual(user);
  });

  it('should return undefined if user not found by email', async () => {
    mockRepository.findOne.mockResolvedValue(undefined as any);

    const result = await userRepository.findByEmail('joao.silva@example.com');

    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { email: 'joao.silva@example.com' },
    });
    expect(result).toBeUndefined();
  });

  it('should find users by filter', async () => {
    const users: User[] = [
      {
        id: '1',
        firstName: 'João',
        lastName: 'Silva',
        cpf: '12345678900',
        email: 'joao.silva@example.com',
        password: 'password',
        role: UserRole.Admin,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const filter: UserFilter = { role: UserRole.Admin };

    mockRepository.find.mockResolvedValue(users);

    const result = await userRepository.findByFilter(filter);

    expect(mockRepository.find).toHaveBeenCalledWith({ where: filter });
    expect(result).toEqual(users);
  });

  it('should find all users', async () => {
    const users: User[] = [
      {
        id: '1',
        firstName: 'João',
        lastName: 'Silva',
        cpf: '12345678900',
        email: 'joao.silva@example.com',
        password: 'password',
        role: UserRole.Deliveryman,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockRepository.find.mockResolvedValue(users);

    const result = await userRepository.findAll();

    expect(mockRepository.find).toHaveBeenCalled();
    expect(result).toEqual(users);
  });

  it('should save a user', async () => {
    const user: User = {
      id: '1',
      firstName: 'João',
      lastName: 'Silva',
      cpf: '12345678900',
      email: 'joao.silva@example.com',
      password: 'password',
      role: UserRole.Deliveryman,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockRepository.save.mockResolvedValue(user);

    const result = await userRepository.save(user);

    expect(mockRepository.save).toHaveBeenCalledWith(user);
    expect(result).toEqual(user);
  });

  it('should remove a user by ID', async () => {
    mockRepository.delete.mockResolvedValue({} as any);

    await userRepository.remove('1');

    expect(mockRepository.delete).toHaveBeenCalledWith('1');
  });
});
