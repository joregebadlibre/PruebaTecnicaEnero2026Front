import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { CustomersPageComponent } from './customers-page.component';
import { CustomersApiService } from '../../core/api/customers-api.service';
import type { CustomerResponse } from '../../core/api/models';

describe('CustomersPageComponent', () => {
  let component: CustomersPageComponent;
  let customersApiSpy: jasmine.SpyObj<CustomersApiService>;

  const mockCustomers: CustomerResponse[] = [
    {
      id: 1,
      name: 'Juan',
      gender: 'Masculino',
      age: 20,
      identification: '1',
      address: 'x',
      phone: '2',
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
      phone: '1',
      password: 'p',
      active: false,
    },
  ];

  beforeEach(async () => {
    customersApiSpy = jasmine.createSpyObj('CustomersApiService', ['list', 'create', 'update', 'delete', 'updateStatus']);
    customersApiSpy.list.and.returnValue(of(mockCustomers));

    await TestBed.configureTestingModule({
      imports: [FormsModule, CustomersPageComponent],
      providers: [{ provide: CustomersApiService, useValue: customersApiSpy }],
    }).compileComponents();

    const fixture = TestBed.createComponent(CustomersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('startCreate should open form', () => {
    component['startCreate']();
    expect(component['formOpen']()).toBe(true);
    expect(component['formMode']()).toBe('create');
  });

  it('startEdit should populate model and open form', () => {
    component['startEdit'](mockCustomers[0]);
    expect(component['formOpen']()).toBe(true);
    expect(component['formMode']()).toBe('edit');
    expect(component['selectedId']()).toBe(1);
  });

  it('save should not call api when invalid', () => {
    const mockForm: any = { valid: false, controls: {} };
    component['startCreate']();
    component['save'](mockForm);
    expect(customersApiSpy.create).not.toHaveBeenCalled();
  });

  it('save should create when in create mode', () => {
    const mockForm: any = { valid: true, controls: {} };
    customersApiSpy.create.and.returnValue(of(mockCustomers[0]));

    component['startCreate']();
    component['formModel'] = {
      name: 'x',
      gender: 'Masculino',
      age: 1,
      identification: '1',
      address: 'x',
      phone: '1',
      password: 'p',
      active: true,
    };

    component['save'](mockForm);

    expect(customersApiSpy.create).toHaveBeenCalledWith(component['formModel']);
    expect(component['formOpen']()).toBe(false);
  });

  it('save should handle save errors', () => {
    const mockForm: any = { valid: true, controls: {} };
    customersApiSpy.create.and.returnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            statusText: 'Bad Request',
            error: 'Error saving customer',
          }),
      ),
    );

    component['startCreate']();
    component['save'](mockForm);

    expect(component['formErrorMessage']()).toBe('Error saving customer');
  });

  it('toggleStatus should call updateStatus when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    customersApiSpy.updateStatus.and.returnValue(of(mockCustomers[0]));

    component['toggleStatus'](mockCustomers[0]);

    expect(window.confirm).toHaveBeenCalledWith('¿Desactivar cliente?');
    expect(customersApiSpy.updateStatus).toHaveBeenCalledWith(1, false);
  });

  it('deleteCustomer should call delete when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    customersApiSpy.delete.and.returnValue(of(undefined));

    component['deleteCustomer'](mockCustomers[0]);

    expect(window.confirm).toHaveBeenCalledWith('¿Eliminar cliente?');
    expect(customersApiSpy.delete).toHaveBeenCalledWith(1);
  });

  it('toggleSort should update sort key/dir', () => {
    component['toggleSort']('phone');
    expect(component['sortKey']()).toBe('phone');

    const dir = component['sortDir']();
    component['toggleSort']('phone');
    expect(component['sortDir']()).not.toBe(dir);
  });
});
