import nodemailer, { Transporter } from 'nodemailer';
import { EmailService } from '../../../../infrastructure/service/EmailService';
import { ApplicationError } from '../../../../infrastructure/shared/errors/ApplicationError';

jest.mock('nodemailer');
const mockedCreateTransport = nodemailer.createTransport as jest.MockedFunction<
  typeof nodemailer.createTransport
>;

describe('EmailService', () => {
  let emailService: EmailService;
  let mockTransporter: jest.Mocked<Transporter>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTransporter = {
      sendMail: jest.fn(),
    } as unknown as jest.Mocked<Transporter>;
    mockedCreateTransport.mockReturnValue(mockTransporter);
    emailService = new EmailService();

    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should send a status update email successfully', async () => {
    const to = 'test@example.com';
    const subject = 'Order Status Update';
    const name = 'John Doe';
    const status = 'Your order has been delivered';
    const trackingCode = 'XYZ12345';

    mockTransporter.sendMail.mockResolvedValue('Email sent');

    await emailService.sendStatusUpdateMail(
      to,
      subject,
      name,
      status,
      trackingCode,
    );

    expect(mockTransporter.sendMail).toHaveBeenCalledWith({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html:
        expect.stringContaining(name) &&
        expect.stringContaining(status) &&
        expect.stringContaining(trackingCode),
    });
    expect(console.log).toHaveBeenCalledWith('E-mail enviado com sucesso');
  });

  it('should throw an ApplicationError when email sending fails', async () => {
    const to = 'test@example.com';
    const subject = 'Order Status Update';
    const name = 'John Doe';
    const status = 'Your order has been delivered';
    const trackingCode = 'XYZ12345';

    mockTransporter.sendMail.mockRejectedValue(
      new Error('Failed to send email'),
    );

    await expect(
      emailService.sendStatusUpdateMail(
        to,
        subject,
        name,
        status,
        trackingCode,
      ),
    ).rejects.toThrow(ApplicationError);
    expect(mockTransporter.sendMail).toHaveBeenCalledWith({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html:
        expect.stringContaining(name) &&
        expect.stringContaining(status) &&
        expect.stringContaining(trackingCode),
    });
    expect(console.error).toHaveBeenCalledWith(
      'Erro ao enviar e-mail',
      expect.any(Error),
    );
  });
});
