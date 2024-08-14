import nodemailer from 'nodemailer';
import 'dotenv/config';
import { ApplicationError } from '../../infrastructure/shared/errors/ApplicationError';

export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'outlook',
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendStatusUpdateMail(
    to: string,
    subject: string,
    name: string,
    status: string,
    trackingCode: string,
  ) {
    const html = `
      <!doctype html>
      <html>
        <body>
          <p>Olá, ${name}!</p>
          <p><strong>${status}</strong>.</p>
          <p>Seu código de rastreamento é: <strong id="trackingCode">${trackingCode}</strong></p>
        </body>
      </html>
    `;

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
      console.error('Erro ao enviar e-mail', error);
      throw new ApplicationError('Falha ao enviar e-mail', 500, true);
    }
  }
}

export default new EmailService();
