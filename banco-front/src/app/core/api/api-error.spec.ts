import { HttpErrorResponse } from '@angular/common/http';

import { getApiErrorMessage } from './api-error';

describe('getApiErrorMessage', () => {
  it('should return "Error inesperado." for non-HttpErrorResponse errors', () => {
    const error = new Error('Generic error');
    const result = getApiErrorMessage(error);
    expect(result).toBe('Error inesperado.');
  });

  it('should return message from ApiError object', () => {
    const apiError = {
      message: 'API error message',
      status: 400,
      error: 'Bad Request',
    };
    const httpError = new HttpErrorResponse({
      status: 400,
      statusText: 'Bad Request',
      error: apiError,
    });

    const result = getApiErrorMessage(httpError);
    expect(result).toBe('API error message');
  });

  it('should return string error body', () => {
    const httpError = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error',
      error: 'String error message',
    });

    const result = getApiErrorMessage(httpError);
    expect(result).toBe('String error message');
  });

  it('should return HttpErrorResponse message when body is empty', () => {
    const httpError = new HttpErrorResponse({
      status: 404,
      statusText: 'Not Found',
      error: null,
      url: 'http://example.com/not-found',
    });

    const result = getApiErrorMessage(httpError);
    expect(result).toBe('Http failure response for http://example.com/not-found: 404 Not Found');
  });

  it('should return HttpErrorResponse message when body has no usable message', () => {
    const httpError = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error',
      error: {},
      url: '',
    });

    const result = getApiErrorMessage(httpError);
    expect(result).toBe(httpError.message);
  });

  it('should handle empty string message', () => {
    const apiError = { message: '   ' };
    const httpError = new HttpErrorResponse({
      status: 400,
      error: apiError,
    });

    const result = getApiErrorMessage(httpError);
    expect(result).toBe(httpError.message);
  });

  it('should handle empty string error body', () => {
    const httpError = new HttpErrorResponse({
      status: 400,
      error: '   ',
    });

    const result = getApiErrorMessage(httpError);
    expect(result).toBe(httpError.message);
  });
});
