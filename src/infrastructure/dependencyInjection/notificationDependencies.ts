import { container } from 'tsyringe';
import { NotificationService } from '../../application/services/NotificationService';

container.register('NotificationService', {
  useClass: NotificationService,
});

export { container } from 'tsyringe';
