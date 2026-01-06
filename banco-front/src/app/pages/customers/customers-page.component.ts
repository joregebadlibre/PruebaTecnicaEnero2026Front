import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { CustomersApiService } from '../../core/api/customers-api.service';
import { getApiErrorMessage } from '../../core/api/api-error';
import type { CustomerRequest, CustomerResponse } from '../../core/api/models';

@Component({
  selector: 'app-customers-page',
  imports: [FormsModule],
  template: `
    <section class="page">
      <div class="page__header">
        <h2 class="page__title">Clientes</h2>
        <button class="btn btn--primary" type="button" (click)="startCreate()">Nuevo</button>
      </div>

      <div class="page__toolbar">
        <input
          class="input"
          type="search"
          placeholder="Buscar"
          [ngModel]="search()"
          (ngModelChange)="search.set($event)"
        />
      </div>

      @if (errorMessage()) {
        <div class="muted">{{ errorMessage() }}</div>
      }

      @if (formOpen()) {
        <div class="panel" style="margin-bottom: 16px">
          <div class="panel__title">{{ formTitle() }}</div>
          <div class="panel__body">
            <form #f="ngForm" (ngSubmit)="save(f)">
              <div class="page__toolbar page__toolbar--grid">
                <label class="field">
                  <span class="field__label">Nombre</span>
                  <input class="input" name="name" [(ngModel)]="formModel.name" required />
                  @if (shouldShowError(f, 'name', 'required')) {
                    <div class="muted">El nombre es obligatorio.</div>
                  }
                </label>

                <label class="field">
                  <span class="field__label">Género</span>
                  <select class="input" name="gender" [(ngModel)]="formModel.gender" required>
                    <option value="" disabled>Seleccione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                  </select>
                  @if (shouldShowError(f, 'gender', 'required')) {
                    <div class="muted">El género es obligatorio.</div>
                  }
                </label>

                <label class="field">
                  <span class="field__label">Edad</span>
                  <input class="input" type="number" name="age" [(ngModel)]="formModel.age" required min="0" />
                  @if (shouldShowError(f, 'age', 'required')) {
                    <div class="muted">La edad es obligatoria.</div>
                  }
                  @if (shouldShowError(f, 'age', 'min')) {
                    <div class="muted">La edad debe ser mayor o igual a 0.</div>
                  }
                </label>

                <label class="field">
                  <span class="field__label">Identificación</span>
                  <input
                    class="input"
                    name="identification"
                    inputmode="numeric"
                    pattern="^[0-9]+$"
                    maxlength="20"
                    [ngModel]="formModel.identification"
                    (ngModelChange)="formModel.identification = ($event ?? '').toString().replace(/[^0-9]/g, '')"
                    required
                  />
                  @if (shouldShowError(f, 'identification', 'required')) {
                    <div class="muted">La identificación es obligatoria.</div>
                  }
                  @if (shouldShowError(f, 'identification', 'pattern')) {
                    <div class="muted">La identificación solo debe contener números.</div>
                  }
                </label>

                <label class="field">
                  <span class="field__label">Dirección</span>
                  <input class="input" name="address" [(ngModel)]="formModel.address" required />
                  @if (shouldShowError(f, 'address', 'required')) {
                    <div class="muted">La dirección es obligatoria.</div>
                  }
                </label>

                <label class="field">
                  <span class="field__label">Teléfono</span>
                  <input
                    class="input"
                    name="phone"
                    inputmode="numeric"
                    pattern="^[0-9]+$"
                    maxlength="15"
                    [ngModel]="formModel.phone"
                    (ngModelChange)="formModel.phone = ($event ?? '').toString().replace(/[^0-9]/g, '')"
                    required
                  />
                  @if (shouldShowError(f, 'phone', 'required')) {
                    <div class="muted">El teléfono es obligatorio.</div>
                  }
                  @if (shouldShowError(f, 'phone', 'pattern')) {
                    <div class="muted">El teléfono solo debe contener números.</div>
                  }
                </label>

                <label class="field">
                  <span class="field__label">Contraseña</span>
                  <input class="input" type="password" name="password" [(ngModel)]="formModel.password" required />
                  @if (shouldShowError(f, 'password', 'required')) {
                    <div class="muted">La contraseña es obligatoria.</div>
                  }
                </label>

                <label class="field" style="display:flex; gap:10px; align-items:center; margin-top: 18px">
                  <input type="checkbox" name="active" [(ngModel)]="formModel.active" />
                  <span class="field__label" style="margin: 0">Activo</span>
                </label>
              </div>

              @if (formErrorMessage()) {
                <div class="muted">{{ formErrorMessage() }}</div>
              }

              <div style="display:flex; gap: 10px; justify-content:flex-end; margin-top: 10px">
                <button class="btn" type="button" (click)="cancelForm()">Cancelar</button>
                <button class="btn btn--primary" type="submit" [disabled]="saving()">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      }

      <div class="table">
        <div class="table__row table__row--customers table__row--head">
          <div class="table__cell table__cell--sortable" (click)="toggleSort('name')">Nombre{{ sortLabel('name') }}</div>
          <div class="table__cell table__cell--sortable" (click)="toggleSort('identification')">Identificación{{ sortLabel('identification') }}</div>
          <div class="table__cell table__cell--sortable" (click)="toggleSort('phone')">Teléfono{{ sortLabel('phone') }}</div>
          <div class="table__cell table__cell--sortable" (click)="toggleSort('active')">Estado{{ sortLabel('active') }}</div>
          <div class="table__cell">Acciones</div>
        </div>
        @for (c of sortedCustomers(); track c.id) {
          <div class="table__row table__row--customers">
            <div class="table__cell">{{ c.name }}</div>
            <div class="table__cell">{{ c.identification }}</div>
            <div class="table__cell">{{ c.phone }}</div>
            <div class="table__cell">{{ c.active ? 'Activo' : 'Inactivo' }}</div>
            <div class="table__cell">
              <div class="table__actions">
                <button class="btn btn--table" type="button" (click)="startEdit(c)">Editar</button>
                <button class="btn btn--table" type="button" (click)="toggleStatus(c)">{{ c.active ? 'Desactivar' : 'Activar' }}</button>
                <button class="btn btn--table" type="button" (click)="deleteCustomer(c)">Eliminar</button>
              </div>
            </div>
          </div>
        }
      </div>
    </section>
  `,
})
export class CustomersPageComponent {
  private readonly api = inject(CustomersApiService);

  protected readonly search = signal<string>('');
  protected readonly customers = signal<CustomerResponse[]>([]);
  protected readonly errorMessage = signal<string>('');

  protected readonly sortKey = signal<'name' | 'identification' | 'phone' | 'active'>('name');
  protected readonly sortDir = signal<'asc' | 'desc'>('asc');

  protected readonly formOpen = signal<boolean>(false);
  protected readonly formMode = signal<'create' | 'edit'>('create');
  protected readonly selectedId = signal<number | null>(null);
  protected readonly saving = signal<boolean>(false);
  protected readonly submitted = signal<boolean>(false);
  protected readonly formErrorMessage = signal<string>('');

  protected formModel: CustomerRequest = this.createEmptyCustomer();

  protected readonly formTitle = computed(() => (this.formMode() === 'create' ? 'Nuevo cliente' : 'Editar cliente'));

  protected readonly filteredCustomers = computed(() => {
    const q = this.search().trim().toLowerCase();
    const customers = this.customers();

    if (!q) {
      return customers;
    }

    return customers.filter((c) => {
      return (
        String(c.id).includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.identification.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
      );
    });
  });

  protected readonly sortedCustomers = computed(() => {
    const rows = [...this.filteredCustomers()];
    const key = this.sortKey();
    const dir = this.sortDir();

    const sign = dir === 'asc' ? 1 : -1;

    const toText = (v: unknown) => String(v ?? '').toLowerCase();

    rows.sort((a, b) => {
      if (key === 'active') {
        const av = a.active ? 1 : 0;
        const bv = b.active ? 1 : 0;
        return (av - bv) * sign;
      }

      const av = toText(a[key]);
      const bv = toText(b[key]);

      if (av < bv) {
        return -1 * sign;
      }
      if (av > bv) {
        return 1 * sign;
      }
      return 0;
    });

    return rows;
  });

  constructor() {
    this.loadList();
  }

  protected startCreate() {
    this.formMode.set('create');
    this.selectedId.set(null);
    this.formModel = this.createEmptyCustomer();
    this.submitted.set(false);
    this.formErrorMessage.set('');
    this.formOpen.set(true);
  }

  protected startEdit(c: CustomerResponse) {
    this.formMode.set('edit');
    this.selectedId.set(c.id);
    this.formModel = {
      name: c.name,
      gender: c.gender,
      age: c.age,
      identification: c.identification,
      address: c.address,
      phone: c.phone,
      password: c.password,
      active: c.active,
    };
    this.submitted.set(false);
    this.formErrorMessage.set('');
    this.formOpen.set(true);
  }

  protected cancelForm() {
    this.formOpen.set(false);
    this.submitted.set(false);
    this.formErrorMessage.set('');
  }

  protected save(f: NgForm) {
    this.submitted.set(true);
    this.formErrorMessage.set('');

    if (!f.valid) {
      return;
    }

    this.saving.set(true);

    const mode = this.formMode();
    const id = this.selectedId();
    const body: CustomerRequest = { ...this.formModel };

    const request$ = mode === 'create' ? this.api.create(body) : this.api.update(id!, body);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.formOpen.set(false);
        this.submitted.set(false);
        this.loadList();
      },
      error: (err) => {
        this.saving.set(false);
        this.formErrorMessage.set(getApiErrorMessage(err));
      },
    });
  }

  protected toggleStatus(c: CustomerResponse) {
    const nextActive = !c.active;
    const confirmMessage = nextActive ? '¿Activar cliente?' : '¿Desactivar cliente?';
    if (!confirm(confirmMessage)) {
      return;
    }

    this.api.updateStatus(c.id, nextActive).subscribe({
      next: () => {
        this.loadList();
      },
      error: (err) => {
        this.errorMessage.set(getApiErrorMessage(err));
      },
    });
  }

  protected deleteCustomer(c: CustomerResponse) {
    if (!confirm('¿Eliminar cliente?')) {
      return;
    }

    this.api.delete(c.id).subscribe({
      next: () => {
        this.loadList();
      },
      error: (err) => {
        this.errorMessage.set(getApiErrorMessage(err));
      },
    });
  }

  protected shouldShowError(f: NgForm, controlName: string, errorName: string): boolean {
    const control = f.controls[controlName];
    if (!control) {
      return false;
    }

    return (this.submitted() || control.touched) && Boolean(control.errors?.[errorName]);
  }

  private loadList() {
    this.api.list().subscribe({
      next: (customers) => {
        this.customers.set(customers);
        this.errorMessage.set('');
      },
      error: (err) => {
        this.errorMessage.set(getApiErrorMessage(err));
      },
    });
  }

  private createEmptyCustomer(): CustomerRequest {
    return {
      name: '',
      gender: '',
      age: 0,
      identification: '',
      address: '',
      phone: '',
      password: '',
      active: true,
    };
  }

  protected toggleSort(key: 'name' | 'identification' | 'phone' | 'active') {
    if (this.sortKey() === key) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
      return;
    }

    this.sortKey.set(key);
    this.sortDir.set('asc');
  }

  protected sortLabel(key: 'name' | 'identification' | 'phone' | 'active') {
    if (this.sortKey() !== key) {
      return '';
    }

    return this.sortDir() === 'asc' ? ' ↑' : ' ↓';
  }
}
