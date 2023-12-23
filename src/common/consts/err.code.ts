// NOTE
// This is just a simple example. For real case, there should be more exhaustive status code.
export enum ErrorCode {
  // SO-SO NEGATIVE
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  BadRequest = 400,
  ExceededRateLimit = 429,

  Unimplemented = 501,

  // TOO MUCH NEGATIVE
  InternalError = 500,
}
