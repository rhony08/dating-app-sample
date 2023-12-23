import { ErrorCode } from '../consts/err.code';

export class BaseError extends Error {
  protected code: ErrorCode;
  protected cause?: BaseError | Error;

  constructor(message?: string) {
    super(message);
    this.name = 'BaseError';

    // 'Error' breaks prototype chain here
    // docs link below
    // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
    Object.setPrototypeOf(this, BaseError.prototype);
  }

  public setCode(ec: ErrorCode) {
    this.code = ec;
  }

  public getCode(): ErrorCode {
    return this.code;
  }

  public wrap(err: BaseError | Error) {
    this.cause = err;
  }

  public unwrap() {
    if (this.cause) {
      return this.cause;
    }

    return null;
  }
}

export class BadRequestError extends BaseError {
  public bags: string[];

  constructor(message?: string, bags?: string[]) {
    super(message);

    this.name = 'ValidationError';
    this.code = ErrorCode.BadRequest;

    this.bags = [];
    if (bags && bags.length > 0) {
      this.bags = bags;
    }

    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class ForbiddenError extends BaseError {
  constructor(message?: string) {
    super(message);

    this.name = 'ForbiddenError';
    this.code = ErrorCode.Forbidden;

    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message?: string) {
    super(message);

    this.name = 'UnauthorizedError';
    this.code = ErrorCode.Unauthorized;

    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class NotFoundError extends BaseError {
  constructor(message?: string) {
    super(message);

    this.name = 'NotFoundError';
    this.code = ErrorCode.NotFound;

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class InternalError extends BaseError {
  constructor(message?: string) {
    super(message);

    this.name = 'InternalError';
    this.code = ErrorCode.InternalError;

    Object.setPrototypeOf(this, InternalError.prototype);
  }
}

export class UnImplementedError extends BaseError {
  constructor(message?: string) {
    super(message);

    this.name = 'UnImplementedError';
    this.code = ErrorCode.Unimplemented;

    Object.setPrototypeOf(this, UnImplementedError.prototype);
  }
}
