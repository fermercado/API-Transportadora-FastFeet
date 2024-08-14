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
    trackingCode: string,
  ) {
    const mensagem = translateStatus(status);
    const assunto = 'Atualização do Status da Sua Encomenda';

    await this.emailService.sendStatusUpdateMail(
      destinatarioEmail,
      assunto,
      nomeDestinatario,
      mensagem,
      trackingCode,
    );
  }
}
