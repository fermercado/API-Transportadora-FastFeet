import { container } from 'tsyringe';
import { TrackingCodeService } from '../../application/services/TrackingCodeService';

container.register('TrackingCodeService', {
  useClass: TrackingCodeService,
});

export { container } from 'tsyringe';
