import { ExternalValidator } from '../../../../domain/validators/ExternalValidator';

describe('ExternalValidator', () => {
  describe('validateCEPResponse', () => {
    it('should throw an error if the CEP response has an error field', () => {
      const mockDataWithError = { erro: true };
      expect(() =>
        ExternalValidator.validateCEPResponse(mockDataWithError),
      ).toThrow('ZipCode invalid.');
    });

    it('should not throw an error if the CEP response is valid', () => {
      const mockValidData = {
        logradouro: 'Some Street',
        localidade: 'Some City',
        uf: 'Some State',
      };
      expect(() =>
        ExternalValidator.validateCEPResponse(mockValidData),
      ).not.toThrow();
    });
  });

  describe('validateGeocodingResponse', () => {
    it('should throw an error if the response status is not 200', () => {
      const mockResponse = { status: 404, data: {} };
      expect(() =>
        ExternalValidator.validateGeocodingResponse(mockResponse),
      ).toThrow('Geocoding API response status is not OK.');
    });

    it('should throw an error if no geocoding results are found', () => {
      const mockResponse = { status: 200, data: { results: [] } };
      expect(() =>
        ExternalValidator.validateGeocodingResponse(mockResponse),
      ).toThrow('No geocoding results found.');
    });

    it('should throw an error if the confidence level of the geocoding result is too low', () => {
      const mockResponse = {
        status: 200,
        data: {
          results: [
            {
              geometry: { lat: 0, lng: 0 },
              confidence: 3,
            },
          ],
        },
      };
      expect(() =>
        ExternalValidator.validateGeocodingResponse(mockResponse),
      ).toThrow('The geocoding result confidence is too low.');
    });

    it('should not throw an error if the geocoding response is valid and confidence is adequate', () => {
      const mockResponse = {
        status: 200,
        data: {
          results: [
            {
              geometry: { lat: 0, lng: 0 },
              confidence: 6,
            },
          ],
        },
      };
      expect(() =>
        ExternalValidator.validateGeocodingResponse(mockResponse),
      ).not.toThrow();
    });
  });
});
