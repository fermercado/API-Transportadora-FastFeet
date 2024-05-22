import nodemailer from 'nodemailer';
import 'dotenv/config';
import { ApplicationError } from '../../infrastructure/shared/errors/ApplicationError';

export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        ciphers: 'SSLv3',
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('E-mail enviado com sucesso');
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      throw new ApplicationError('Falha ao enviar e-mail', 500, true);
    }
  }
}

export default new EmailService();
