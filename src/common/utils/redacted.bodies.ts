const sensitiveHeaders = ['password'];

/**
 * Redacts sensitive headers from the given headers object.
 *
 * @param headers - The headers object to redact sensitive headers from.
 * @returns A new object with sensitive headers redacted.
 */
export function redactBodies(body: any): Record<string, any> {
  /**
   * An object that stores the redacted headers.
   */
  const redactedHeaders: any = {};

  for (const [key, value] of Object.entries(body)) {
    redactedHeaders[key] = sensitiveHeaders.includes(key.toLowerCase())
      ? '[REDACTED]'
      : value;
  }

  return redactedHeaders;
}
