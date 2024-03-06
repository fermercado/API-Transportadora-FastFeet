export class ApplicationError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: { field: string; message: string }[];
    details: any;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    errors?: { field: string; message: string }[],
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}
