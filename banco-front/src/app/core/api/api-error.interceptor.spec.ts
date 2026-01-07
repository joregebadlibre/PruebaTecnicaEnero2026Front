import { HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { apiErrorInterceptor } from './api-error.interceptor';

describe('apiErrorInterceptor', () => {
  let mockNext: jasmine.Spy;
  let mockRequest: HttpRequest<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    mockNext = jasmine.createSpy('next').and.returnValue(of({}));
    mockRequest = new HttpRequest('GET', '/test');
  });

  it('should pass through successful responses', () => {
    const mockResponse = { data: 'success' };
    mockNext.and.returnValue(of(mockResponse));

    apiErrorInterceptor(mockRequest, mockNext).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    expect(mockNext).toHaveBeenCalledWith(mockRequest);
  });

  it('should handle HttpErrorResponse', () => {
    const errorResponse = new HttpErrorResponse({
      status: 404,
      statusText: 'Not Found',
      error: { message: 'Resource not found' },
    });
    mockNext.and.returnValue(throwError(() => errorResponse));

    apiErrorInterceptor(mockRequest, mockNext).subscribe({
      next: () => fail('should have failed'),
      error: (err) => {
        expect(err).toBe(errorResponse);
      },
    });

    expect(mockNext).toHaveBeenCalledWith(mockRequest);
  });

  it('should handle non-HttpErrorResponse errors', () => {
    const genericError = new Error('Generic error');
    mockNext.and.returnValue(throwError(() => genericError));

    apiErrorInterceptor(mockRequest, mockNext).subscribe({
      next: () => fail('should have failed'),
      error: (err) => {
        expect(err).toBe(genericError);
      },
    });

    expect(mockNext).toHaveBeenCalledWith(mockRequest);
  });
});
