import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { AccountsApiService } from '../../core/api/accounts-api.service';
import { CustomersApiService } from '../../core/api/customers-api.service';
import { getApiErrorMessage } from '../../core/api/api-error';
import type { AccountRequest, AccountResponse, CustomerResponse } from '../../core/api/models';

@Component({
  selector: 'app-accounts-page',
  imports: [FormsModule],
  template: `
    <section class="page">
      <div class="page__header">
        <h2 class="page__title">Cuentas</h2>
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
              <div class="page__toolbar page__toolbar--grid" style="grid-template-columns: 1fr 170px 170px 140px">
                <label class="field">
                  <span class="field__label">Número</span>
                  <input class="input" type="number" name="accountNumber" [(ngModel)]="formModel.accountNumber" required />
                  @if (shouldShowError(f, 'accountNumber', 'required')) {
                    <div class="muted">El número es obligatorio.</div>
                  }
                </label>

                <label class="field">
                  <span class="field__label">Tipo</span>
                  <select class="input" name="accountType" [(ngModel)]="formModel.accountType" required>
                    <option value="AHORRO">AHORRO</option>
                    <option value="CORRIENTE">CORRIENTE</option>
                  </select>
                  @if (shouldShowError(f, 'accountType', 'required')) {
                    <div class="muted">El tipo es obligatorio.</div>
                  }
                </label>

                <label class="field">
                  <span class="field__label">Saldo Inicial</span>
                  <input class="input" type="number" name="initialBalance" [(ngModel)]="formModel.initialBalance" required />
                  @if (shouldShowError(f, 'initialBalance', 'required')) {
                    <div class="muted">El saldo inicial es obligatorio.</div>
                  }
                </label>

                <label class="field">
                  <span class="field__label">Cliente</span>
                  <input class="input" type="number" name="customerId" [(ngModel)]="formModel.customerId" required />
                  @if (shouldShowError(f, 'customerId', 'required')) {
                    <div class="muted">El cliente es obligatorio.</div>
                  }
                </label>
              </div>

              <label class="field" style="display:flex; gap:10px; align-items:center; margin-top: 10px">
                <input type="checkbox" name="active" [(ngModel)]="formModel.active" />
                <span class="field__label" style="margin: 0">Activo</span>
              </label>

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
        <div class="table__row table__row--accounts table__row--head">
          <div class="table__cell table__cell--sortable" (click)="toggleSort('accountNumber')">Número{{ sortLabel('accountNumber') }}</div>
          <div class="table__cell table__cell--sortable" (click)="toggleSort('accountType')">Tipo{{ sortLabel('accountType') }}</div>
          <div class="table__cell table__cell--sortable" (click)="toggleSort('initialBalance')">Saldo Inicial{{ sortLabel('initialBalance') }}</div>
          <div class="table__cell table__cell--sortable" (click)="toggleSort('customerName')">Cliente{{ sortLabel('customerName') }}</div>
          <div class="table__cell table__cell--sortable" (click)="toggleSort('active')">Estado{{ sortLabel('active') }}</div>
          <div class="table__cell">Acciones</div>
        </div>
        @for (a of sortedAccounts(); track a.id) {
          <div class="table__row table__row--accounts">
            <div class="table__cell">{{ a.accountNumber }}</div>
            <div class="table__cell">{{ a.accountType }}</div>
            <div class="table__cell">{{ a.initialBalance }}</div>
            <div class="table__cell">{{ customerName(a.customerId) }}</div>
            <div class="table__cell">{{ a.active ? 'Activo' : 'Inactivo' }}</div>
            <div class="table__cell">
              <div class="table__actions">
                <button class="btn btn--table" type="button" (click)="startEdit(a)">Editar</button>
                <button class="btn btn--table" type="button" (click)="toggleActive(a)">{{ a.active ? 'Desactivar' : 'Activar' }}</button>
                <button class="btn btn--table" type="button" (click)="deleteAccount(a)">Eliminar</button>
              </div>
            </div>
          </div>
        }
      </div>
    </section>
  `,
})
export class AccountsPageComponent {
  private readonly api = inject(AccountsApiService);
  private readonly customersApi = inject(CustomersApiService);

  protected readonly search = signal<string>('');
  protected readonly accounts = signal<AccountResponse[]>([]);
  protected readonly errorMessage = signal<string>('');

  protected readonly sortKey = signal<'id' | 'accountNumber' | 'accountType' | 'initialBalance' | 'customerId' | 'customerName' | 'active'>(
    'accountNumber',
  );
  protected readonly sortDir = signal<'asc' | 'desc'>('asc');

  protected readonly customers = signal<CustomerResponse[]>([]);
  protected readonly customerNameById = computed<Record<number, string>>(() => {
    const rows = this.customers();
    const map: Record<number, string> = {};
    for (const c of rows) {
      map[c.id] = c.name;
    }
    return map;
  });

  protected readonly formOpen = signal<boolean>(false);
  protected readonly formMode = signal<'create' | 'edit'>('create');
  protected readonly selectedId = signal<number | null>(null);
  protected readonly saving = signal<boolean>(false);
  protected readonly submitted = signal<boolean>(false);
  protected readonly formErrorMessage = signal<string>('');

  protected formModel: AccountRequest = this.createEmptyAccount();

  protected readonly formTitle = computed(() => (this.formMode() === 'create' ? 'Nueva cuenta' : 'Editar cuenta'));

  protected readonly filteredAccounts = computed(() => {
    const q = this.search().trim().toLowerCase();
    const accounts = this.accounts();

    if (!q) {
      return accounts;
    }

    return accounts.filter((a) => {
      const customerName = this.customerName(a.customerId).toLowerCase();
      return (
        String(a.id).includes(q) ||
        String(a.accountNumber).includes(q) ||
        a.accountType.toLowerCase().includes(q) ||
        String(a.customerId).includes(q) ||
        customerName.includes(q)
      );
    });
  });

  protected readonly sortedAccounts = computed(() => {
    const rows = [...this.filteredAccounts()];
    const key = this.sortKey();
    const dir = this.sortDir();

    const sign = dir === 'asc' ? 1 : -1;

    rows.sort((a, b) => {
      if (key === 'customerName') {
        const as = this.customerName(a.customerId).toLowerCase();
        const bs = this.customerName(b.customerId).toLowerCase();

        if (as < bs) {
          return -1 * sign;
        }
        if (as > bs) {
          return 1 * sign;
        }
        return 0;
      }

      const av = a[key] as unknown;
      const bv = b[key] as unknown;

      if (typeof av === 'number' && typeof bv === 'number') {
        return (av - bv) * sign;
      }

      if (typeof av === 'boolean' && typeof bv === 'boolean') {
        return ((av ? 1 : 0) - (bv ? 1 : 0)) * sign;
      }

      const as = String(av ?? '').toLowerCase();
      const bs = String(bv ?? '').toLowerCase();

      if (as < bs) {
        return -1 * sign;
      }
      if (as > bs) {
        return 1 * sign;
      }
      return 0;
    });

    return rows;
  });

  constructor() {
    this.loadList();
  }

  protected customerName(customerId: number): string {
    return this.customerNameById()[customerId] ?? String(customerId);
  }

  protected startCreate() {
    this.formMode.set('create');
    this.selectedId.set(null);
    this.formModel = this.createEmptyAccount();
    this.submitted.set(false);
    this.formErrorMessage.set('');
    this.formOpen.set(true);
  }

  protected startEdit(a: AccountResponse) {
    this.formMode.set('edit');
    this.selectedId.set(a.id);
    this.formModel = {
      accountNumber: a.accountNumber,
      accountType: a.accountType,
      initialBalance: a.initialBalance,
      active: a.active,
      customerId: a.customerId,
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
    const body: AccountRequest = { ...this.formModel };

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

  protected toggleActive(a: AccountResponse) {
    const confirmMessage = a.active ? '¿Desactivar cuenta?' : '¿Activar cuenta?';
    if (!confirm(confirmMessage)) {
      return;
    }

    const body: AccountRequest = {
      accountNumber: a.accountNumber,
      accountType: a.accountType,
      initialBalance: a.initialBalance,
      active: !a.active,
      customerId: a.customerId,
    };

    this.api.update(a.id, body).subscribe({
      next: () => {
        this.loadList();
      },
      error: (err) => {
        this.errorMessage.set(getApiErrorMessage(err));
      },
    });
  }

  protected deleteAccount(a: AccountResponse) {
    if (!confirm('¿Eliminar cuenta?')) {
      return;
    }

    this.api.delete(a.id).subscribe({
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

  protected toggleSort(key: 'id' | 'accountNumber' | 'accountType' | 'initialBalance' | 'customerId' | 'customerName' | 'active') {
    if (this.sortKey() === key) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
      return;
    }

    this.sortKey.set(key);
    this.sortDir.set('asc');
  }

  protected sortLabel(key: 'id' | 'accountNumber' | 'accountType' | 'initialBalance' | 'customerId' | 'customerName' | 'active') {
    if (this.sortKey() !== key) {
      return '';
    }

    return this.sortDir() === 'asc' ? ' ↑' : ' ↓';
  }

  private loadList() {
    this.api.list().subscribe({
      next: (accounts) => {
        this.accounts.set(accounts);
        this.errorMessage.set('');
      },
      error: (err) => {
        this.errorMessage.set(getApiErrorMessage(err));
      },
    });

    this.customersApi.list().subscribe({
      next: (customers) => {
        this.customers.set(customers);
      },
      error: () => {
        this.customers.set([]);
      },
    });
  }

  private createEmptyAccount(): AccountRequest {
    return {
      accountNumber: 0,
      accountType: 'AHORRO',
      initialBalance: 0,
      active: true,
      customerId: 0,
    };
  }
}
