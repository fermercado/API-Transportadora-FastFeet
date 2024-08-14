import 'reflect-metadata';
import { DeliveryNotificationService } from '../../../../application/services/DeliveryNotificationService';
import { EmailService } from '../../../../infrastructure/service/EmailService';
import { translateStatus } from '../../../../infrastructure/shared/utils/translateStatus';

jest.mock('../../../../infrastructure/service/EmailService');
jest.mock('../../../../infrastructure/shared/utils/translateStatus');

describe('DeliveryNotificationService', () => {
  let deliveryNotificationService: DeliveryNotificationService;
  let emailServiceMock: jest.Mocked<EmailService>;

  beforeEach(() => {
    emailServiceMock = new EmailService() as jest.Mocked<EmailService>;
    emailServiceMock.sendStatusUpdateMail = jest.fn();
    deliveryNotificationService = new DeliveryNotificationService(
      emailServiceMock,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send status update email with correct parameters', async () => {
    const destinatarioEmail = 'example@example.com';
    const nomeDestinatario = 'João Silva';
    const status = 'delivered';
    const trackingCode = 'TRACK123';
    const translatedMessage = 'Your package has been delivered';

    (translateStatus as jest.Mock).mockReturnValue(translatedMessage);

    await deliveryNotificationService.sendStatusUpdateEmail(
      destinatarioEmail,
      nomeDestinatario,
      status,
      trackingCode,
    );

    const expectedSubject = 'Atualização do Status da Sua Encomenda';

    expect(emailServiceMock.sendStatusUpdateMail).toHaveBeenCalledWith(
      destinatarioEmail,
      expectedSubject,
      nomeDestinatario,
      translatedMessage,
      trackingCode,
    );
    expect(translateStatus).toHaveBeenCalledWith(status);
  });

  it('should handle errors when sending email', async () => {
    const destinatarioEmail = 'example@example.com';
    const nomeDestinatario = 'João Silva';
    const status = 'delivered';
    const trackingCode = 'TRACK123';
    const translatedMessage = 'Your package has been delivered';
    const expectedSubject = 'Atualização do Status da Sua Encomenda';

    (translateStatus as jest.Mock).mockReturnValue(translatedMessage);
    emailServiceMock.sendStatusUpdateMail.mockRejectedValue(
      new Error('Failed to send email'),
    );

    await expect(
      deliveryNotificationService.sendStatusUpdateEmail(
        destinatarioEmail,
        nomeDestinatario,
        status,
        trackingCode,
      ),
    ).rejects.toThrow('Failed to send email');

    expect(translateStatus).toHaveBeenCalledWith(status);
    expect(emailServiceMock.sendStatusUpdateMail).toHaveBeenCalledWith(
      destinatarioEmail,
      expectedSubject,
      nomeDestinatario,
      translatedMessage,
      trackingCode,
    );
  });
});
