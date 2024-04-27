import { ErrorDetail } from '../../../@types/error-types';

export class ApplicationError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: ErrorDetail[];

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: ErrorDetail[],
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  public formatForLogging(): string {
    const detailString =
      this.details?.map((d) => `${d.key}: ${d.value}`).join(', ') ||
      'No details';
    return `${this.message} - Status: ${this.statusCode} - Details: ${detailString}`;
  }

  public serializeForResponse(): object {
    return {
      error: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }

  public isOperationalError(): boolean {
    return this.isOperational;
  }
}
