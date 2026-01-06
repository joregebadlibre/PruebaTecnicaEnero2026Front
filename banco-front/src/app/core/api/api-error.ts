import { HttpErrorResponse } from '@angular/common/http';

import type { ApiError } from './models';

export function getApiErrorMessage(err: unknown): string {
  if (!(err instanceof HttpErrorResponse)) {
    return 'Error inesperado.';
  }

  const body = err.error as ApiError | string | null | undefined;

  if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string' && body.message.trim()) {
    return body.message;
  }

  if (typeof body === 'string' && body.trim()) {
    return body;
  }

  if (typeof err.message === 'string' && err.message.trim()) {
    return err.message;
  }

  return 'Error inesperado.';
}
