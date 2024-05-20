import nodemailer from 'nodemailer';
import { EmailService } from '../../../../infrastructure/service/EmailService';
import { ApplicationError } from '../../../../infrastructure/shared/errors/ApplicationError';

jest.mock('nodemailer');
const mockedCreateTransport = nodemailer.createTransport as jest.MockedFunction<
  typeof nodemailer.createTransport
>;

describe('EmailService', () => {
  let emailService: EmailService;
  let mockTransporter: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTransporter = {
      sendMail: jest.fn(),
    };
    mockedCreateTransport.mockReturnValue(
      mockTransporter as unknown as nodemailer.Transporter,
    );
    emailService = new EmailService();

    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should send an email successfully', async () => {
    const to = 'test@example.com';
    const subject = 'Test Subject';
    const html = '<p>Test Email</p>';

    mockTransporter.sendMail.mockResolvedValue('Email sent');

    await emailService.sendMail(to, subject, html);

    expect(mockTransporter.sendMail).toHaveBeenCalledWith({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    expect(console.log).toHaveBeenCalledWith('E-mail enviado com sucesso');
  });

  it('should throw an ApplicationError when email sending fails', async () => {
    const to = 'test@example.com';
    const subject = 'Test Subject';
    const html = '<p>Test Email</p>';

    mockTransporter.sendMail.mockRejectedValue(
      new Error('Failed to send email'),
    );

    await expect(emailService.sendMail(to, subject, html)).rejects.toThrow(
      ApplicationError,
    );
    expect(mockTransporter.sendMail).toHaveBeenCalledWith({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    expect(console.error).toHaveBeenCalledWith(
      'Erro ao enviar e-mail',
      expect.any(Error),
    );
  });
});
