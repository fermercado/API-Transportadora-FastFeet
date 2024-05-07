import { injectable } from 'tsyringe';

@injectable()
export class TrackingCodeService {
  public generateTrackingCode(
    carrierName: string,
    recipientState: string,
  ): string {
    const carrierInitials = carrierName
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
    const uniqueNumber = Math.floor(Math.random() * 1e9)
      .toString()
      .padStart(9, '0');
    return `${carrierInitials}${uniqueNumber}${recipientState.toUpperCase()}`;
  }
}
