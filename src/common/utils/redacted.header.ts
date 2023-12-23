const sensitiveHeaders = [
  'authorization',
  'cookie',
  'set-cookie',
  'accept',
  'accept-encoding',
];

/**
 * Redacts sensitive headers from the given headers object.
 *
 * @param headers - The headers object to redact sensitive headers from.
 * @returns A new object with sensitive headers redacted.
 */
export function redactHeaders(headers: any): Record<string, string> {
  /**
   * An object that stores the redacted headers.
   */
  const redactedHeaders: any = {};

  for (const [key, value] of Object.entries(headers)) {
    redactedHeaders[key] = sensitiveHeaders.includes(key.toLowerCase())
      ? '[REDACTED]'
      : value;
  }

  return redactedHeaders;
}
