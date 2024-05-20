import axios from 'axios';
import { ExternalServices } from '../../../../infrastructure/externalService/ExternalService';
import { ExternalValidator } from '../../../../infrastructure/externalService/ExternalValidator';

jest.mock('axios');
jest.mock('../../../../infrastructure/externalService/ExternalValidator');

describe('ExternalServices', () => {
  describe('getAddressByZipCode', () => {
    const mockAxios = axios as jest.Mocked<typeof axios>;
    const mockDataCEP = {
      logradouro: 'Rua Exemplo',
      localidade: 'Cidade Exemplo',
      uf: 'Estado Exemplo',
    };
    const mockDataCoordinates = {
      results: [{ geometry: { lat: -23.5630907, lng: -46.6544215 } }],
    };

    beforeEach(() => {
      jest.resetAllMocks();
      ExternalValidator.validateCEPResponse = jest.fn();
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should return address and coordinates correctly when ZIP code is found', async () => {
      mockAxios.get
        .mockResolvedValueOnce({ data: mockDataCEP })
        .mockResolvedValueOnce({ data: mockDataCoordinates });

      const result = await ExternalServices.getAddressByZipCode('01001000');

      expect(result).toEqual({
        ...mockDataCEP,
        latitude: -23.5630907,
        longitude: -46.6544215,
      });
      expect(mockAxios.get).toHaveBeenCalledTimes(2);
      expect(ExternalValidator.validateCEPResponse).toHaveBeenCalledWith(
        mockDataCEP,
      );
    });

    it('should throw an error when ZIP code lookup fails', async () => {
      mockAxios.get.mockRejectedValueOnce(
        new Error('Failed to retrieve ZIP code information.'),
      );

      await expect(
        ExternalServices.getAddressByZipCode('01001000'),
      ).rejects.toThrow('Failed to retrieve ZIP code information.');
      expect(mockAxios.get).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when no results are found for the address', async () => {
      mockAxios.get
        .mockResolvedValueOnce({ data: mockDataCEP })
        .mockResolvedValueOnce({ data: { results: [] } });

      await expect(
        ExternalServices.getAddressByZipCode('01001000'),
      ).rejects.toThrow('Failed to retrieve ZIP code information.');
      expect(mockAxios.get).toHaveBeenCalledTimes(2);
    });
  });
});
