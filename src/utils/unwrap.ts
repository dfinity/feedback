/**
 * Unwrap an optional value provided by Candid.
 */
export function unwrap<T>(optional: [T] | []): T {
  if (optional.length) {
    return optional[0];
  }
  throw new Error('Received null');
}
