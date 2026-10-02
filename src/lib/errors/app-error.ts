export type ErrorCode =
  | 'AUTH_REQUIRED'
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'CLOSED_DAY'
  | 'DUPLICATE_REQUEST'
  | 'SYNC_FAILED'
  | 'CONFLICT'
  | 'SERVER_ERROR'
  | 'PARTY_NOT_FOUND'
  | 'CATEGORY_NOT_FOUND'
  | 'ALREADY_CLOSED';

export interface AppErrorPayload {
  error: {
    code: ErrorCode;
    message: string;
    requestId: string;
    retryable: boolean;
    details?: unknown;
  };
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly retryable: boolean;
  public readonly details?: unknown;
  public readonly requestId: string;

  constructor(options: {
    code: ErrorCode;
    message: string;
    statusCode?: number;
    retryable?: boolean;
    details?: unknown;
    requestId?: string;
  }) {
    super(options.message);
    this.name = 'AppError';
    this.code = options.code;
    this.statusCode = options.statusCode ?? getHttpStatusForCode(options.code);
    this.retryable = options.retryable ?? false;
    this.details = options.details;
    this.requestId = options.requestId || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }

  toResponsePayload(): AppErrorPayload {
    return {
      error: {
        code: this.code,
        message: this.message,
        requestId: this.requestId,
        retryable: this.retryable,
        details: this.details,
      },
    };
  }
}

function getHttpStatusForCode(code: ErrorCode): number {
  switch (code) {
    case 'AUTH_REQUIRED':
      return 401;
    case 'FORBIDDEN':
      return 403;
    case 'PARTY_NOT_FOUND':
    case 'CATEGORY_NOT_FOUND':
      return 404;
    case 'VALIDATION_ERROR':
      return 400;
    case 'CLOSED_DAY':
    case 'ALREADY_CLOSED':
    case 'CONFLICT':
      return 409;
    case 'DUPLICATE_REQUEST':
      return 409;
    case 'SYNC_FAILED':
    case 'SERVER_ERROR':
    default:
      return 500;
  }
}
