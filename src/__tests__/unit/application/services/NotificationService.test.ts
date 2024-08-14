import 'reflect-metadata';
import { container } from 'tsyringe';
import { NotificationService } from '../../../../application/services/NotificationService';
import { DeliveryNotificationService } from '../../../../application/services/DeliveryNotificationService';
import { EmailService } from '../../../../infrastructure/service/EmailService';
import { Order } from '../../../../domain/entities/Order';

jest.mock('../../../../infrastructure/service/EmailService');

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let deliveryNotificationServiceMock: jest.Mocked<DeliveryNotificationService>;

  beforeEach(() => {
    const emailServiceMock: jest.Mocked<EmailService> =
      new EmailService() as jest.Mocked<EmailService>;
    deliveryNotificationServiceMock = new DeliveryNotificationService(
      emailServiceMock,
    ) as jest.Mocked<DeliveryNotificationService>;
    deliveryNotificationServiceMock.sendStatusUpdateEmail = jest.fn();

    container.registerInstance(
      'DeliveryNotificationService',
      deliveryNotificationServiceMock,
    );
    notificationService = container.resolve(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not send notification if recipient email is missing', async () => {
    const order: Order = {
      recipient: {
        email: '',
        firstName: 'João',
      },
      status: 'delivered',
      trackingCode: '12345ABC',
    } as Order;

    await notificationService.notifyStatusChange(order);

    expect(
      deliveryNotificationServiceMock.sendStatusUpdateEmail,
    ).not.toHaveBeenCalled();
  });

  it('should send notification if recipient email is present', async () => {
    const order: Order = {
      recipient: {
        email: 'example@example.com',
        firstName: 'João',
      },
      status: 'delivered',
      trackingCode: '12345ABC',
    } as Order;

    await notificationService.notifyStatusChange(order);

    expect(
      deliveryNotificationServiceMock.sendStatusUpdateEmail,
    ).toHaveBeenCalledWith(
      'example@example.com',
      'João',
      'delivered',
      '12345ABC',
    );
  });

  it('should handle errors when sending notification', async () => {
    const order: Order = {
      recipient: {
        email: 'example@example.com',
        firstName: 'João',
      },
      status: 'delivered',
      trackingCode: '12345ABC',
    } as Order;

    deliveryNotificationServiceMock.sendStatusUpdateEmail.mockRejectedValue(
      new Error('Failed to send email'),
    );

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await expect(notificationService.notifyStatusChange(order)).rejects.toThrow(
      'Failed to send email',
    );

    expect(
      deliveryNotificationServiceMock.sendStatusUpdateEmail,
    ).toHaveBeenCalledWith(
      'example@example.com',
      'João',
      'delivered',
      '12345ABC',
    );

    consoleErrorSpy.mockRestore();
  });
});
