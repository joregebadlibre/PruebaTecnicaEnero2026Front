import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { AccountsApiService } from '../../core/api/accounts-api.service';
import { TransactionsApiService } from '../../core/api/transactions-api.service';
import { TransactionsPageComponent } from './transactions-page.component';
import type { AccountResponse, TransactionResponse } from '../../core/api/models';

describe('TransactionsPageComponent', () => {
  let component: TransactionsPageComponent;

  let accountsApiSpy: jasmine.SpyObj<AccountsApiService>;
  let transactionsApiSpy: jasmine.SpyObj<TransactionsApiService>;

  const mockAccounts: AccountResponse[] = [
    { id: 1, accountNumber: 100, accountType: 'AHORRO', initialBalance: 0, active: true, customerId: 1 },
  ];

  const mockTransactions: TransactionResponse[] = [
    { id: 1, accountId: 1, transactionType: 'DEBITO', amount: 10, balance: 90, date: '2024-01-01T10:00:00Z' },
    { id: 2, accountId: 1, transactionType: 'CREDITO', amount: 20, balance: 110, date: '2024-01-02T10:00:00Z' },
  ];

  beforeEach(async () => {
    accountsApiSpy = jasmine.createSpyObj('AccountsApiService', ['list']);
    transactionsApiSpy = jasmine.createSpyObj('TransactionsApiService', ['list', 'create', 'update', 'delete']);

    accountsApiSpy.list.and.returnValue(of(mockAccounts));
    transactionsApiSpy.list.and.returnValue(of(mockTransactions));

    await TestBed.configureTestingModule({
      imports: [FormsModule, TransactionsPageComponent],
      providers: [
        { provide: AccountsApiService, useValue: accountsApiSpy },
        { provide: TransactionsApiService, useValue: transactionsApiSpy },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(TransactionsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('accountNumber should resolve from loaded accounts', () => {
    expect(component['accountNumber'](1)).toBe('100');
    expect(component['accountNumber'](999)).toBe('999');
  });

  it('startCreate should open form', () => {
    component['startCreate']();
    expect(component['formOpen']()).toBe(true);
    expect(component['formMode']()).toBe('create');
  });

  it('save should not call api when invalid', () => {
    const mockForm: any = { valid: false, controls: {} };
    component['startCreate']();
    component['save'](mockForm);
    expect(transactionsApiSpy.create).not.toHaveBeenCalled();
  });

  it('save should create when in create mode', () => {
    const mockForm: any = { valid: true, controls: {} };
    transactionsApiSpy.create.and.returnValue(of(mockTransactions[0]));

    component['startCreate']();
    component['formModel'] = { accountId: 1, transactionType: 'DEBITO', amount: 10 };
    component['save'](mockForm);

    expect(transactionsApiSpy.create).toHaveBeenCalledWith(component['formModel']);
    expect(component['formOpen']()).toBe(false);
  });

  it('save should set formErrorMessage on error', () => {
    const mockForm: any = { valid: true, controls: {} };
    transactionsApiSpy.create.and.returnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            statusText: 'Bad Request',
            error: 'Error saving transaction',
          }),
      ),
    );

    component['startCreate']();
    component['save'](mockForm);

    expect(component['formErrorMessage']()).toBe('Error saving transaction');
  });

  it('deleteTransaction should call delete when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    transactionsApiSpy.delete.and.returnValue(of(undefined));

    component['deleteTransaction'](mockTransactions[0]);

    expect(window.confirm).toHaveBeenCalledWith('¿Eliminar movimiento?');
    expect(transactionsApiSpy.delete).toHaveBeenCalledWith(1);
  });

  it('toggleSort should toggle dir when same key', () => {
    component['toggleSort']('date');
    const firstDir = component['sortDir']();
    component['toggleSort']('date');
    expect(component['sortDir']()).not.toBe(firstDir);
  });
});
