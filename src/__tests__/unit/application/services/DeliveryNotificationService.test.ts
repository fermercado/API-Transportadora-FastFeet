import 'reflect-metadata';
import { DeliveryNotificationService } from '../../../../application/services/DeliveryNotificationService';
import { EmailService } from '../../../../infrastructure/service/EmailService';
import { translateStatus } from '../../../../application/utils/translateStatus';

jest.mock('../../../../infrastructure/service/EmailService');
jest.mock('../../../../application/utils/translateStatus');

describe('DeliveryNotificationService', () => {
  let deliveryNotificationService: DeliveryNotificationService;
  let emailServiceMock: jest.Mocked<EmailService>;

  beforeEach(() => {
    emailServiceMock = new EmailService() as jest.Mocked<EmailService>;
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
    const translatedMessage = 'Your package has been delivered';

    (translateStatus as jest.Mock).mockReturnValue(translatedMessage);

    await deliveryNotificationService.sendStatusUpdateEmail(
      destinatarioEmail,
      nomeDestinatario,
      status,
    );

    const expectedSubject = 'Atualização do Status da Sua Encomenda';
    const expectedHtmlContent = `
      <html>
      <body>
        <p>Olá, ${nomeDestinatario}!</p>
        <p>${translatedMessage}</p>
      </body>
      </html>
    `;

    expect(emailServiceMock.sendMail).toHaveBeenCalledWith(
      destinatarioEmail,
      expectedSubject,
      expectedHtmlContent,
    );
    expect(translateStatus).toHaveBeenCalledWith(status);
  });

  it('should handle errors when sending email', async () => {
    const destinatarioEmail = 'example@example.com';
    const nomeDestinatario = 'João Silva';
    const status = 'delivered';
    const translatedMessage = 'Your package has been delivered';

    (translateStatus as jest.Mock).mockReturnValue(translatedMessage);
    emailServiceMock.sendMail.mockRejectedValue(
      new Error('Failed to send email'),
    );

    await expect(
      deliveryNotificationService.sendStatusUpdateEmail(
        destinatarioEmail,
        nomeDestinatario,
        status,
      ),
    ).rejects.toThrow('Failed to send email');

    expect(translateStatus).toHaveBeenCalledWith(status);
    expect(emailServiceMock.sendMail).toHaveBeenCalled();
  });
});
