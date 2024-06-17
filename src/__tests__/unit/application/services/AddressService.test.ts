import axios from 'axios';
import { CepValidationProvider } from '../../../../infrastructure/providers/CepValidationProvider';
import { AddressService } from '../../../../application/services/AddressService';
import { ExternalValidator } from '../../../../domain/validators/ExternalValidator';

jest.mock('axios');
jest.mock('../../../../domain/validators/ExternalValidator');

describe('AddressService', () => {
  let cepValidationProvider: CepValidationProvider;
  let addressService: AddressService;
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
    cepValidationProvider = new CepValidationProvider();
    addressService = new AddressService(cepValidationProvider);
    ExternalValidator.validateCEPResponse = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should return address and coordinates correctly when ZIP code is found', async () => {
    mockAxios.get
      .mockResolvedValueOnce({ data: mockDataCEP })
      .mockResolvedValueOnce({ data: mockDataCoordinates });

    const result = await addressService.getAddressByZipCode('01001000');

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
      addressService.getAddressByZipCode('01001000'),
    ).rejects.toThrow('Failed to retrieve ZIP code information.');
    expect(mockAxios.get).toHaveBeenCalledTimes(1);
  });

  it('should throw an error when no results are found for the address', async () => {
    mockAxios.get
      .mockResolvedValueOnce({ data: mockDataCEP })
      .mockResolvedValueOnce({ data: { results: [] } });

    await expect(
      addressService.getAddressByZipCode('01001000'),
    ).rejects.toThrow('Failed to retrieve ZIP code information.');
    expect(mockAxios.get).toHaveBeenCalledTimes(2);
  });
});
