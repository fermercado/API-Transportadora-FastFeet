import { ApplicationError } from '../../../../infrastructure/shared/errors/ApplicationError';

describe('ApplicationError', () => {
  const defaultMessage = 'An error occurred';
  const defaultStatusCode = 500;
  const defaultDetails = [{ key: 'missing', value: 'data' }];

  it('should correctly set all properties', () => {
    const error = new ApplicationError(
      defaultMessage,
      defaultStatusCode,
      true,
      defaultDetails,
    );
    expect(error.message).toBe(defaultMessage);
    expect(error.statusCode).toBe(defaultStatusCode);
    expect(error.isOperational).toBe(true);
    expect(error.details).toEqual(defaultDetails);
  });

  it('should format error details for logging', () => {
    const error = new ApplicationError(
      defaultMessage,
      defaultStatusCode,
      true,
      defaultDetails,
    );
    const logString = error.formatForLogging();
    expect(logString).toContain(defaultMessage);
    expect(logString).toContain(`${defaultStatusCode}`);
    expect(logString).toContain('missing: data');
  });

  it('should return a default log message when details are absent', () => {
    const error = new ApplicationError(defaultMessage, defaultStatusCode);
    const logString = error.formatForLogging();
    expect(logString).toContain('No details');
  });

  it('should serialize error for response correctly', () => {
    const error = new ApplicationError(
      defaultMessage,
      defaultStatusCode,
      true,
      defaultDetails,
    );
    const serializedError = error.serializeForResponse();
    expect(serializedError).toEqual({
      error: defaultMessage,
      statusCode: defaultStatusCode,
      details: defaultDetails,
    });
  });

  it('should identify as operational error when marked as operational', () => {
    const error = new ApplicationError(defaultMessage, defaultStatusCode, true);
    expect(error.isOperationalError()).toBe(true);
  });

  it('should identify as non-operational error when not marked as operational', () => {
    const error = new ApplicationError(
      defaultMessage,
      defaultStatusCode,
      false,
    );
    expect(error.isOperationalError()).toBe(false);
  });
  it('should use default status code when none is provided', () => {
    const defaultMessage = 'An error occurred';
    const error = new ApplicationError(defaultMessage);
    expect(error.statusCode).toBe(500);
    expect(error.message).toBe(defaultMessage);
    expect(error.isOperational).toBe(true);
  });
});
