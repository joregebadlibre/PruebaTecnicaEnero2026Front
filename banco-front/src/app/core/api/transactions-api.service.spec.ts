import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_CONFIG } from './api.config';
import { TransactionsApiService } from './transactions-api.service';

describe('TransactionsApiService', () => {
  let service: TransactionsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TransactionsApiService,
        {
          provide: API_CONFIG,
          useValue: { baseUrl: 'http://localhost:3000' },
        },
      ],
    });

    service = TestBed.inject(TransactionsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should list', () => {
    service.list().subscribe();

    const req = httpMock.expectOne('http://localhost:3000/transactions');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should getById', () => {
    service.getById(1).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/transactions/1');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should create', () => {
    service.create({ accountId: 1, transactionType: 'DEBITO', amount: 10 }).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/transactions');
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should update', () => {
    service.update(1, { accountId: 1, transactionType: 'DEBITO', amount: 10 }).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/transactions/1');
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('should delete', () => {
    service.delete(1).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/transactions/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
