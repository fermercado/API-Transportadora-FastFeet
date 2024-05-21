import { DateUtils } from '../../../../infrastructure/shared/utils/dateUtils';

describe('DateUtils', () => {
  describe('formatToBrazilianDateTime', () => {
    it('should return a formatted date string for a valid date input', () => {
      const date = new Date('2023-05-16T12:34:56Z');
      const formattedDate = DateUtils.formatToBrazilianDateTime(date);
      expect(formattedDate).toBe('16/05/2023 09:34:56');
    });

    it('should return an empty string for undefined input', () => {
      const formattedDate = DateUtils.formatToBrazilianDateTime(undefined);
      expect(formattedDate).toBe('');
    });

    it('should handle different date instances correctly', () => {
      const date = new Date('2024-12-25T15:30:45Z');
      const formattedDate = DateUtils.formatToBrazilianDateTime(date);
      expect(formattedDate).toBe('25/12/2024 12:30:45');
    });
  });
});
