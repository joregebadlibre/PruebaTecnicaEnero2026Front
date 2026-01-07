import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_CONFIG } from './api.config';
import { CustomersApiService } from './customers-api.service';

describe('CustomersApiService', () => {
  let service: CustomersApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CustomersApiService,
        {
          provide: API_CONFIG,
          useValue: { baseUrl: 'http://localhost:3000' },
        },
      ],
    });

    service = TestBed.inject(CustomersApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should list customers', () => {
    service.list().subscribe();

    const req = httpMock.expectOne('http://localhost:3000/customers');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should getById', () => {
    service.getById(1).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/customers/1');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should create', () => {
    service
      .create({
        name: 'a',
        gender: 'Masculino',
        age: 1,
        identification: '1',
        address: 'x',
        phone: '1',
        password: 'p',
        active: true,
      })
      .subscribe();

    const req = httpMock.expectOne('http://localhost:3000/customers');
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should update', () => {
    service
      .update(1, {
        name: 'a',
        gender: 'Masculino',
        age: 1,
        identification: '1',
        address: 'x',
        phone: '1',
        password: 'p',
        active: true,
      })
      .subscribe();

    const req = httpMock.expectOne('http://localhost:3000/customers/1');
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('should delete', () => {
    service.delete(1).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/customers/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should updateStatus', () => {
    service.updateStatus(10, false).subscribe();

    const req = httpMock.expectOne((r) => r.url === 'http://localhost:3000/customers/10/status' && r.params.get('active') === 'false');
    expect(req.request.method).toBe('PATCH');
    req.flush({});
  });
});
