import { injectable } from 'tsyringe';
import { EmailService } from '../../infrastructure/service/EmailService';
import { translateStatus } from '../../infrastructure/shared/utils/translateStatus';

@injectable()
export class DeliveryNotificationService {
  constructor(private emailService: EmailService) {}

  async sendStatusUpdateEmail(
    destinatarioEmail: string,
    nomeDestinatario: string,
    status: string,
  ) {
    const mensagem = translateStatus(status);
    const assunto = 'Atualização do Status da Sua Encomenda';
    const conteudoHtml = `
      <html>
      <body>
        <p>Olá, ${nomeDestinatario}!</p>
        <p>${mensagem}</p>
      </body>
      </html>
    `;

    await this.emailService.sendMail(destinatarioEmail, assunto, conteudoHtml);
  }
}
