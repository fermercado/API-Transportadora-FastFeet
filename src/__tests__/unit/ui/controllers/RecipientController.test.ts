import 'reflect-metadata';
import { Request, Response, NextFunction } from 'express';
import { RecipientService } from '../../../../application/services/RecipientService';
import { RecipientController } from '../../../../ui/controllers/RecipientController';
import { ApplicationError } from '../../../../infrastructure/shared/errors/ApplicationError';
import { RecipientMapper } from '../../../../application/mappers/RecipientMapper';
import { RecipientValidationService } from '../../../../application/validation/RecipientValidationService';
import { RecipientRepository } from '../../../../infrastructure/orm/repositories/RecipientRepository';

jest.mock('../../../../application/services/RecipientService');
jest.mock('../../../../application/mappers/RecipientMapper');
jest.mock('../../../../application/validation/RecipientValidationService');
jest.mock('../../../../infrastructure/orm/repositories/RecipientRepository');

describe('RecipientController', () => {
  let recipientServiceMock: jest.Mocked<RecipientService>;
  let recipientController: RecipientController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    const recipientValidationService = new RecipientValidationService(
      {} as any,
    );
    const recipientRepository = new RecipientRepository({} as any);
    const recipientMapper = new RecipientMapper();

    recipientServiceMock = new RecipientService(
      recipientRepository,
      recipientValidationService,
      recipientMapper,
    ) as jest.Mocked<RecipientService>;

    recipientController = new RecipientController(recipientServiceMock);

    req = {
      body: {},
      params: {},
    };
    jsonMock = jest.fn();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jsonMock,
      send: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('should create a recipient and return 201 status', async () => {
    const mockRecipient = {
      id: '1',
      firstName: 'Maria',
      lastName: 'Silva',
      email: 'maria.silva@example.com',
      cpf: '123.456.789-09',
      zipCode: '12345-678',
      street: 'Main St',
      number: 123,
      complement: 'Apt 4',
      neighborhood: 'Downtown',
      city: 'Metropolis',
      state: 'NY',
      latitude: 40.7128,
      longitude: -74.006,
    };
    recipientServiceMock.createRecipient.mockResolvedValue(mockRecipient);

    req.body = {
      firstName: 'Maria',
      lastName: 'Silva',
      email: 'maria.silva@example.com',
    };

    await recipientController.createRecipient(
      req as Request,
      res as Response,
      next,
    );

    expect(recipientServiceMock.createRecipient).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockRecipient);
  });

  it('should handle ApplicationError in createRecipient', async () => {
    const error = new ApplicationError('Test error', 400, true);
    recipientServiceMock.createRecipient.mockRejectedValue(error);

    req.body = {
      firstName: 'Maria',
      lastName: 'Silva',
      email: 'maria.silva@example.com',
    };

    await recipientController.createRecipient(
      req as Request,
      res as Response,
      next,
    );

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should handle other errors in createRecipient', async () => {
    const error = new Error('Test error');
    recipientServiceMock.createRecipient.mockRejectedValue(error);

    req.body = {
      firstName: 'Maria',
      lastName: 'Silva',
      email: 'maria.silva@example.com',
    };

    await recipientController.createRecipient(
      req as Request,
      res as Response,
      next,
    );

    expect(next).toHaveBeenCalledWith(
      new ApplicationError('Failed to create recipient', 500, true, [
        { key: 'internal', value: 'Error during recipient creation' },
      ]),
    );
  });

  it('should update a recipient and return 200 status', async () => {
    const mockRecipient = {
      id: '1',
      firstName: 'Maria',
      lastName: 'Silva',
      email: 'maria.silva@example.com',
      cpf: '123.456.789-09',
      zipCode: '12345-678',
      street: 'Main St',
      number: 123,
      complement: 'Apt 4',
      neighborhood: 'Downtown',
      city: 'Metropolis',
      state: 'NY',
      latitude: 40.7128,
      longitude: -74.006,
    };
    recipientServiceMock.updateRecipient.mockResolvedValue(mockRecipient);

    req.params = { id: '1' };
    req.body = { firstName: 'Maria', lastName: 'Silva Updated' };

    await recipientController.updateRecipient(
      req as Request,
      res as Response,
      next,
    );

    expect(recipientServiceMock.updateRecipient).toHaveBeenCalledWith(
      '1',
      req.body,
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockRecipient);
  });

  it('should handle ApplicationError in updateRecipient', async () => {
    const error = new ApplicationError('Test error', 400, true);
    recipientServiceMock.updateRecipient.mockRejectedValue(error);

    req.params = { id: '1' };
    req.body = { firstName: 'Maria', lastName: 'Silva Updated' };

    await recipientController.updateRecipient(
      req as Request,
      res as Response,
      next,
    );

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should handle other errors in updateRecipient', async () => {
    const error = new Error('Test error');
    recipientServiceMock.updateRecipient.mockRejectedValue(error);

    req.params = { id: '1' };
    req.body = { firstName: 'Maria', lastName: 'Silva Updated' };

    await recipientController.updateRecipient(
      req as Request,
      res as Response,
      next,
    );

    expect(next).toHaveBeenCalledWith(
      new ApplicationError('Failed to update recipient', 500, true, [
        { key: 'internal', value: 'Error during recipient update' },
      ]),
    );
  });

  it('should delete a recipient and return 204 status', async () => {
    req.params = { id: '1' };

    await recipientController.deleteRecipient(
      req as Request,
      res as Response,
      next,
    );

    expect(recipientServiceMock.deleteRecipient).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('should handle ApplicationError in deleteRecipient', async () => {
    const error = new ApplicationError('Test error', 400, true);
    recipientServiceMock.deleteRecipient.mockRejectedValue(error);

    req.params = { id: '1' };

    await recipientController.deleteRecipient(
      req as Request,
      res as Response,
      next,
    );

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should handle other errors in deleteRecipient', async () => {
    const error = new Error('Test error');
    recipientServiceMock.deleteRecipient.mockRejectedValue(error);

    req.params = { id: '1' };

    await recipientController.deleteRecipient(
      req as Request,
      res as Response,
      next,
    );

    expect(next).toHaveBeenCalledWith(
      new ApplicationError('Failed to delete recipient', 500, true, [
        { key: 'internal', value: 'Error during recipient deletion' },
      ]),
    );
  });

  it('should return a recipient by id and return 200 status', async () => {
    const mockRecipient = {
      id: '1',
      firstName: 'Maria',
      lastName: 'Silva',
      email: 'maria.silva@example.com',
      cpf: '123.456.789-09',
      zipCode: '12345-678',
      street: 'Main St',
      number: 123,
      complement: 'Apt 4',
      neighborhood: 'Downtown',
      city: 'Metropolis',
      state: 'NY',
      latitude: 40.7128,
      longitude: -74.006,
    };
    recipientServiceMock.findRecipientById.mockResolvedValue(mockRecipient);

    req.params = { id: '1' };

    await recipientController.getRecipientById(
      req as Request,
      res as Response,
      next,
    );

    expect(recipientServiceMock.findRecipientById).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockRecipient);
  });

  it('should handle recipient not found', async () => {
    recipientServiceMock.findRecipientById.mockResolvedValue(undefined);

    req.params = { id: '1' };

    await recipientController.getRecipientById(
      req as Request,
      res as Response,
      next,
    );

    expect(next).toHaveBeenCalledWith(
      new ApplicationError('Recipient not found', 404, true),
    );
  });

  it('should handle getRecipientById errors', async () => {
    const error = new Error('Test error');
    recipientServiceMock.findRecipientById.mockRejectedValue(error);

    req.params = { id: '1' };

    await recipientController.getRecipientById(
      req as Request,
      res as Response,
      next,
    );

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should return all recipients and return 200 status', async () => {
    const mockRecipients = [
      {
        id: '1',
        firstName: 'Maria',
        lastName: 'Silva',
        email: 'maria.silva@example.com',
        cpf: '123.456.789-09',
        zipCode: '12345-678',
        street: 'Main St',
        number: 123,
        complement: 'Apt 4',
        neighborhood: 'Downtown',
        city: 'Metropolis',
        state: 'NY',
        latitude: 40.7128,
        longitude: -74.006,
      },
    ];
    recipientServiceMock.listRecipients.mockResolvedValue(mockRecipients);

    await recipientController.getAllRecipients(
      req as Request,
      res as Response,
      next,
    );

    expect(recipientServiceMock.listRecipients).toHaveBeenCalledWith();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockRecipients);
  });

  it('should handle ApplicationError in getAllRecipients', async () => {
    const error = new ApplicationError('Test error', 400, true);
    recipientServiceMock.listRecipients.mockRejectedValue(error);

    await recipientController.getAllRecipients(
      req as Request,
      res as Response,
      next,
    );

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should handle other errors in getAllRecipients', async () => {
    const error = new Error('Test error');
    recipientServiceMock.listRecipients.mockRejectedValue(error);

    await recipientController.getAllRecipients(
      req as Request,
      res as Response,
      next,
    );

    expect(next).toHaveBeenCalledWith(
      new ApplicationError('Failed to list recipients', 500, true, [
        { key: 'internal', value: 'Error during listing recipients' },
      ]),
    );
  });
});
