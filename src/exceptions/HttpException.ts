export class HttpException extends Error {
  public code: number;
  public status: string;
  public message: string;

  constructor(code: number, status: string, message: string) {
    super(message);
    this.code = code;
    this.status = status;
    this.message = message;
  }
}

/**
 * Returns a response with status code 400.
 */
export class HttpExceptionBadRequest extends HttpException {
  constructor(message: string) {
    super(400, "BAD_REQUEST", message);
  }
}
/**
 * Returns a response with status code 401.
 */
export class HttpExceptionUnauthorize extends HttpException {
  constructor(message: string) {
    super(401, "UNAUTHORIZED", message);
  }
}

/**
 * Returns a response with status code 404.
 */
export class HttpExceptionNotFound extends HttpException {
  constructor(message: string) {
    super(404, "NOT_FOUND", message);
  }
}

/**
 * Returns a response with status code 429.
 */
export class HttpExceptionTooManyRequests extends HttpException {
  constructor(message: string) {
    super(429, "TOO_MANY_REQUEST", message);
  }
}

/**
 * Returns a response with status code 403.
 */
export class HttpExceptionForbidden extends HttpException {
  constructor(message: string) {
    super(403, "FORBIDDEN", message);
  }
}

/**
 * Returns a validation error response.
 */
export class HttpExceptionValidationError extends HttpException {
  constructor(message: string) {
    super(422, "UNPROCESSABLE_ENTITY", message);
  }
}
