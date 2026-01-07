import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { CustomersApiService } from '../../core/api/customers-api.service';
import { ReportsApiService } from '../../core/api/reports-api.service';
import type { AccountStatementReport, CustomerResponse } from '../../core/api/models';
import { ReportsPageComponent } from './reports-page.component';

describe('ReportsPageComponent', () => {
  let component: ReportsPageComponent;
  let reportsApiSpy: jasmine.SpyObj<ReportsApiService>;
  let customersApiSpy: jasmine.SpyObj<CustomersApiService>;

  const mockCustomers: CustomerResponse[] = [
    {
      id: 1,
      name: 'John Doe',
      gender: 'Masculino',
      age: 30,
      identification: '123',
      address: 'Street 1',
      phone: '999',
      password: 'p',
      active: true,
    },
  ];

  const mockReport: AccountStatementReport = {
    customerId: 1,
    customerName: 'John Doe',
    from: '2024-01-01',
    to: '2024-01-31',
    accounts: [],
    totalCredits: 1000,
    totalDebits: 500,
    pdfBase64: 'SGVsbG8=',
  };

  beforeEach(async () => {
    reportsApiSpy = jasmine.createSpyObj('ReportsApiService', ['getAccountStatement']);
    customersApiSpy = jasmine.createSpyObj('CustomersApiService', ['list']);

    customersApiSpy.list.and.returnValue(of(mockCustomers));

    await TestBed.configureTestingModule({
      imports: [FormsModule, ReportsPageComponent],
      providers: [
        { provide: ReportsApiService, useValue: reportsApiSpy },
        { provide: CustomersApiService, useValue: customersApiSpy },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ReportsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filteredCustomerOptions should filter by query', () => {
    component['customerQuery'].set('john');
    expect(component['filteredCustomerOptions']().length).toBe(1);

    component['customerQuery'].set('xxx');
    expect(component['filteredCustomerOptions']().length).toBe(0);
  });

  it('loadReport should show validation error when missing inputs', () => {
    component.from = '';
    component.to = '';
    component['customerQuery'].set('');

    component['loadReport']();

    expect(component['errorMessage']()).toBe('Debe ingresar customerId o nombre del cliente, desde y hasta.');
  });

  it('loadReport should set report on success', () => {
    reportsApiSpy.getAccountStatement.and.returnValue(of(mockReport));

    component.from = '2024-01-01';
    component.to = '2024-01-31';
    component['customerQuery'].set('1');

    component['loadReport']();

    expect(component['report']()).toEqual(mockReport);
    expect(component['errorMessage']()).toBe('');
  });

  it('loadReport should handle errors', () => {
    const httpError = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error',
      error: null,
    });
    reportsApiSpy.getAccountStatement.and.returnValue(throwError(() => httpError));

    component.from = '2024-01-01';
    component.to = '2024-01-31';
    component['customerQuery'].set('1');

    component['loadReport']();

    expect(component['report']()).toBeNull();
    expect(component['errorMessage']()).toBe(httpError.message);
  });

  describe('downloadPdf', () => {
    let createElementSpy: jest.SpyInstance;
    let createObjectUrlSpy: jest.SpyInstance;
    let revokeObjectUrlSpy: jest.SpyInstance;

    beforeEach(() => {
      component['report'].set(mockReport);

      createObjectUrlSpy = jest.spyOn(URL as any, 'createObjectURL').mockReturnValue('blob:mock');
      revokeObjectUrlSpy = jest.spyOn(URL as any, 'revokeObjectURL').mockImplementation(() => undefined);
      createElementSpy = jest.spyOn(document, 'createElement').mockImplementation(() => {
        return {
          click: jest.fn(),
          set href(_v: string) {},
          set download(_v: string) {},
        } as unknown as HTMLAnchorElement;
      });
    });

    afterEach(() => {
      createElementSpy?.mockRestore();
      createObjectUrlSpy?.mockRestore();
      revokeObjectUrlSpy?.mockRestore();
    });

    it('should create a Blob URL and trigger download when report has pdfBase64', () => {
      component['downloadPdf']();

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock');
    });

    it('should do nothing when report is null', () => {
      component['report'].set(null);
      component['downloadPdf']();

      expect(URL.createObjectURL).not.toHaveBeenCalled();
    });

    it('should do nothing when pdfBase64 is missing', () => {
      component['report'].set({ ...mockReport, pdfBase64: '' });
      component['downloadPdf']();

      expect(URL.createObjectURL).not.toHaveBeenCalled();
    });
  });
});
