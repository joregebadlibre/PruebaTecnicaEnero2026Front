import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_CONFIG } from './api.config';
import { ReportsApiService } from './reports-api.service';

describe('ReportsApiService', () => {
  let service: ReportsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ReportsApiService,
        {
          provide: API_CONFIG,
          useValue: { baseUrl: 'http://localhost:3000' },
        },
      ],
    });

    service = TestBed.inject(ReportsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should request account statement report', () => {
    service.getAccountStatement({ customerId: 1, from: '2024-01-01', to: '2024-01-31' }).subscribe();

    const req = httpMock.expectOne((r) => {
      return (
        r.url === 'http://localhost:3000/reports' &&
        r.params.get('customerId') === '1' &&
        r.params.get('from') === '2024-01-01' &&
        r.params.get('to') === '2024-01-31'
      );
    });

    expect(req.request.method).toBe('GET');
    req.flush({});
  });
});
