/**
 * Error whose message is safe to surface to the client (intentional,
 * user-facing validation/domain messages). Any other thrown error is treated
 * as unexpected and is never echoed back verbatim, to avoid leaking internal
 * details (e.g. database driver messages) in API responses.
 */
export class DomainError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "DomainError";
    this.status = status;
  }
}
