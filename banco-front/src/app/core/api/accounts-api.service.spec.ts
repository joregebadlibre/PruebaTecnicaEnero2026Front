import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_CONFIG } from './api.config';
import { AccountsApiService } from './accounts-api.service';

describe('AccountsApiService', () => {
  let service: AccountsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AccountsApiService,
        {
          provide: API_CONFIG,
          useValue: { baseUrl: 'http://localhost:3000' },
        },
      ],
    });

    service = TestBed.inject(AccountsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should list accounts', () => {
    service.list().subscribe();

    const req = httpMock.expectOne('http://localhost:3000/accounts');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should list accounts with customerId param', () => {
    service.list(10).subscribe();

    const req = httpMock.expectOne((r) => r.url === 'http://localhost:3000/accounts' && r.params.get('customerId') === '10');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should getById', () => {
    service.getById(5).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/accounts/5');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should create', () => {
    service.create({ accountNumber: 1, accountType: 'AHORRO', initialBalance: 0, active: true, customerId: 1 }).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/accounts');
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should update', () => {
    service.update(2, { accountNumber: 1, accountType: 'AHORRO', initialBalance: 0, active: true, customerId: 1 }).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/accounts/2');
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('should delete', () => {
    service.delete(3).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/accounts/3');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
