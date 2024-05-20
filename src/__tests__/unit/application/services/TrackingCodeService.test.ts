import 'reflect-metadata';
import { TrackingCodeService } from '../../../../application/services/TrackingCodeService';

describe('TrackingCodeService', () => {
  let trackingCodeService: TrackingCodeService;

  beforeEach(() => {
    trackingCodeService = new TrackingCodeService();
  });

  it('should generate a tracking code with correct format', () => {
    const carrierName = 'Fast Shipping';
    const recipientState = 'NY';

    const trackingCode = trackingCodeService.generateTrackingCode(
      carrierName,
      recipientState,
    );

    expect(trackingCode).toMatch(/^FS\d{9}NY$/);
  });

  it('should generate unique tracking codes', () => {
    const carrierName = 'Express Delivery';
    const recipientState = 'CA';

    const trackingCode1 = trackingCodeService.generateTrackingCode(
      carrierName,
      recipientState,
    );
    const trackingCode2 = trackingCodeService.generateTrackingCode(
      carrierName,
      recipientState,
    );

    expect(trackingCode1).not.toBe(trackingCode2);
  });

  it('should handle carrier names with single word correctly', () => {
    const carrierName = 'Uber';
    const recipientState = 'TX';

    const trackingCode = trackingCodeService.generateTrackingCode(
      carrierName,
      recipientState,
    );

    expect(trackingCode).toMatch(/^U\d{9}TX$/);
  });
});
