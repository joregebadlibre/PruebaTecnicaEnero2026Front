import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { AccountsPageComponent } from './accounts-page.component';
import { AccountsApiService } from '../../core/api/accounts-api.service';
import { CustomersApiService } from '../../core/api/customers-api.service';
import type { AccountResponse, CustomerResponse } from '../../core/api/models';

describe('AccountsPageComponent', () => {
  let component: AccountsPageComponent;

  let accountsApiSpy: jasmine.SpyObj<AccountsApiService>;
  let customersApiSpy: jasmine.SpyObj<CustomersApiService>;

  const mockCustomers: CustomerResponse[] = [
    {
      id: 1,
      name: 'Juan',
      gender: 'Masculino',
      age: 20,
      identification: '1',
      address: 'x',
      phone: '1',
      password: 'p',
      active: true,
    },
    {
      id: 2,
      name: 'Ana',
      gender: 'Femenino',
      age: 22,
      identification: '2',
      address: 'y',
      phone: '2',
      password: 'p',
      active: true,
    },
  ];

  const mockAccounts: AccountResponse[] = [
    { id: 1, accountNumber: 200, accountType: 'AHORRO', initialBalance: 10, active: true, customerId: 1 },
    { id: 2, accountNumber: 100, accountType: 'CORRIENTE', initialBalance: 20, active: false, customerId: 2 },
  ];

  beforeEach(async () => {
    accountsApiSpy = jasmine.createSpyObj('AccountsApiService', ['list', 'create', 'update', 'delete']);
    customersApiSpy = jasmine.createSpyObj('CustomersApiService', ['list']);

    accountsApiSpy.list.and.returnValue(of(mockAccounts));
    customersApiSpy.list.and.returnValue(of(mockCustomers));

    await TestBed.configureTestingModule({
      imports: [FormsModule, AccountsPageComponent],
      providers: [
        { provide: AccountsApiService, useValue: accountsApiSpy },
        { provide: CustomersApiService, useValue: customersApiSpy },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AccountsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('customerName should resolve from loaded customers', () => {
    expect(component['customerName'](1)).toBe('Juan');
    expect(component['customerName'](999)).toBe('999');
  });

  it('startCreate should open form and reset state', () => {
    component['startCreate']();
    expect(component['formOpen']()).toBe(true);
    expect(component['formMode']()).toBe('create');
    expect(component['selectedId']()).toBeNull();
  });

  it('startEdit should populate form model', () => {
    component['startEdit'](mockAccounts[0]);
    expect(component['formOpen']()).toBe(true);
    expect(component['formMode']()).toBe('edit');
    expect(component['selectedId']()).toBe(1);
    expect(component['formModel'].accountNumber).toBe(200);
  });

  it('save should not call api when form is invalid', () => {
    const mockForm: any = { valid: false, controls: {} };
    component['startCreate']();
    component['save'](mockForm);
    expect(accountsApiSpy.create).not.toHaveBeenCalled();
  });

  it('save should create when in create mode', () => {
    const mockForm: any = { valid: true, controls: {} };
    accountsApiSpy.create.and.returnValue(of(mockAccounts[0]));

    component['startCreate']();
    component['formModel'] = {
      accountNumber: 123,
      accountType: 'AHORRO',
      initialBalance: 0,
      active: true,
      customerId: 1,
    };

    component['save'](mockForm);

    expect(accountsApiSpy.create).toHaveBeenCalled();
    expect(component['formOpen']()).toBe(false);
  });

  it('save should update when in edit mode', () => {
    const mockForm: any = { valid: true, controls: {} };
    accountsApiSpy.update.and.returnValue(of(mockAccounts[0]));

    component['startEdit'](mockAccounts[0]);
    component['save'](mockForm);

    expect(accountsApiSpy.update).toHaveBeenCalledWith(1, component['formModel']);
    expect(component['formOpen']()).toBe(false);
  });

  it('save should set formErrorMessage on error', () => {
    const mockForm: any = { valid: true, controls: {} };
    accountsApiSpy.create.and.returnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            statusText: 'Bad Request',
            error: 'Error saving account',
          }),
      ),
    );

    component['startCreate']();
    component['save'](mockForm);

    expect(component['formErrorMessage']()).toBe('Error saving account');
  });

  it('toggleActive should call update when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    accountsApiSpy.update.and.returnValue(of(mockAccounts[0]));

    component['toggleActive'](mockAccounts[0]);

    expect(window.confirm).toHaveBeenCalledWith('¿Desactivar cuenta?');
    expect(accountsApiSpy.update).toHaveBeenCalled();
  });

  it('deleteAccount should call delete when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    accountsApiSpy.delete.and.returnValue(of(undefined));

    component['deleteAccount'](mockAccounts[0]);

    expect(window.confirm).toHaveBeenCalledWith('¿Eliminar cuenta?');
    expect(accountsApiSpy.delete).toHaveBeenCalledWith(1);
  });

  it('toggleSort should change sort key and direction', () => {
    component['toggleSort']('accountNumber');
    expect(component['sortKey']()).toBe('accountNumber');

    const firstDir = component['sortDir']();
    component['toggleSort']('accountNumber');
    expect(component['sortDir']()).not.toBe(firstDir);
  });
});
