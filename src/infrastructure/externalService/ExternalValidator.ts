const MINIMUM_CONFIDENCE_THRESHOLD = 5;
export class ExternalValidator {
  static validateCEPResponse(data: any): void {
    if (data.erro) {
      throw new Error('ZipCode invalid.');
    }
  }

  static validateGeocodingResponse(response: any): void {
    if (response.status !== 200) {
      throw new Error('Geocoding API response status is not OK.');
    }

    const data = response.data;
    if (!data.results || data.results.length === 0) {
      throw new Error('No geocoding results found.');
    }

    const firstResult = data.results[0];
    if (
      !firstResult.confidence ||
      firstResult.confidence < MINIMUM_CONFIDENCE_THRESHOLD
    ) {
      throw new Error('The geocoding result confidence is too low.');
    }
  }
}
