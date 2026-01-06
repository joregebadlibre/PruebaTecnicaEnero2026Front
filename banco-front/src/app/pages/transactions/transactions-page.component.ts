import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { AccountsApiService } from '../../core/api/accounts-api.service';
import { TransactionsApiService } from '../../core/api/transactions-api.service';
import { getApiErrorMessage } from '../../core/api/api-error';
import type { AccountResponse, TransactionRequest, TransactionResponse } from '../../core/api/models';

@Component({
  selector: 'app-transactions-page',
  imports: [FormsModule],
  template: `
    <section class="page">
      <div class="page__header">
        <h2 class="page__title">Movimientos</h2>
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
                  <span class="field__label">Cuenta</span>
                  <input class="input" type="number" name="accountId" [(ngModel)]="formModel.accountId" required />
                  @if (shouldShowError(f, 'accountId', 'required')) {
                    <div class="muted">La cuenta es obligatoria.</div>
                  }
                </label>

                <label class="field">
                  <span class="field__label">Tipo</span>
                  <select class="input" name="transactionType" [(ngModel)]="formModel.transactionType" required>
                    <option value="CREDITO">CREDITO</option>
                    <option value="DEBITO">DEBITO</option>
                  </select>
                  @if (shouldShowError(f, 'transactionType', 'required')) {
                    <div class="muted">El tipo es obligatorio.</div>
                  }
                </label>

                <label class="field">
                  <span class="field__label">Monto</span>
                  <input class="input" type="number" name="amount" [(ngModel)]="formModel.amount" required />
                  @if (shouldShowError(f, 'amount', 'required')) {
                    <div class="muted">El monto es obligatorio.</div>
                  }
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
        <div class="table__row table__row--transactions table__row--head">
          <div class="table__cell table__cell--sortable" (click)="toggleSort('date')">Fecha{{ sortLabel('date') }}</div>
          <div class="table__cell table__cell--sortable" (click)="toggleSort('transactionType')">Tipo{{ sortLabel('transactionType') }}</div>
          <div class="table__cell table__cell--sortable" (click)="toggleSort('amount')">Monto{{ sortLabel('amount') }}</div>
          <div class="table__cell table__cell--sortable" (click)="toggleSort('balance')">Saldo{{ sortLabel('balance') }}</div>
          <div class="table__cell table__cell--sortable" (click)="toggleSort('accountNumber')">Cuenta{{ sortLabel('accountNumber') }}</div>
          <div class="table__cell">Acciones</div>
        </div>
        @for (t of sortedTransactions(); track t.id) {
          <div class="table__row table__row--transactions">
            <div class="table__cell">{{ formatDate(t.date) }}</div>
            <div class="table__cell">{{ t.transactionType }}</div>
            <div class="table__cell">{{ t.amount }}</div>
            <div class="table__cell">{{ t.balance }}</div>
            <div class="table__cell">{{ accountNumber(t.accountId) }}</div>
            <div class="table__cell">
              <div class="table__actions">
                <button class="btn btn--table" type="button" (click)="startEdit(t)">Editar</button>
                <button class="btn btn--table" type="button" (click)="deleteTransaction(t)">Eliminar</button>
              </div>
            </div>
          </div>
        }
      </div>
    </section>
  `,
})
export class TransactionsPageComponent {
  private readonly accountsApi = inject(AccountsApiService);
  private readonly api = inject(TransactionsApiService);

  protected readonly search = signal<string>('');
  protected readonly transactions = signal<TransactionResponse[]>([]);
  protected readonly errorMessage = signal<string>('');

  protected readonly sortKey = signal<'id' | 'date' | 'transactionType' | 'amount' | 'balance' | 'accountId' | 'accountNumber'>('date');
  protected readonly sortDir = signal<'asc' | 'desc'>('desc');

  protected readonly accounts = signal<AccountResponse[]>([]);
  protected readonly accountNumberById = computed<Record<number, number>>(() => {
    const rows = this.accounts();
    const map: Record<number, number> = {};
    for (const a of rows) {
      map[a.id] = a.accountNumber;
    }
    return map;
  });

  protected readonly formOpen = signal<boolean>(false);
  protected readonly formMode = signal<'create' | 'edit'>('create');
  protected readonly selectedId = signal<number | null>(null);
  protected readonly saving = signal<boolean>(false);
  protected readonly submitted = signal<boolean>(false);
  protected readonly formErrorMessage = signal<string>('');

  protected formModel: TransactionRequest = this.createEmptyTransaction();

  protected readonly formTitle = computed(() => (this.formMode() === 'create' ? 'Nuevo movimiento' : 'Editar movimiento'));

  protected readonly filteredTransactions = computed(() => {
    const q = this.search().trim().toLowerCase();
    const txs = this.transactions();

    if (!q) {
      return txs;
    }

    return txs.filter((t) => {
      const accountNumber = this.accountNumber(t.accountId).toLowerCase();
      return (
        String(t.id).includes(q) ||
        t.transactionType.toLowerCase().includes(q) ||
        String(t.accountId).includes(q) ||
        String(t.amount).includes(q) ||
        accountNumber.includes(q)
      );
    });
  });

  protected readonly sortedTransactions = computed(() => {
    const rows = [...this.filteredTransactions()];
    const key = this.sortKey();
    const dir = this.sortDir();

    const sign = dir === 'asc' ? 1 : -1;

    rows.sort((a, b) => {
      if (key === 'accountNumber') {
        const as = this.accountNumber(a.accountId).toLowerCase();
        const bs = this.accountNumber(b.accountId).toLowerCase();

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

  protected accountNumber(accountId: number): string {
    const number = this.accountNumberById()[accountId];
    return number == null ? String(accountId) : String(number);
  }

  protected formatDate(value: string): string {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      return value;
    }

    const hasTime = value.includes('T') || value.includes(':');

    if (!hasTime) {
      return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(d);
    }

    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
  }

  protected startCreate() {
    this.formMode.set('create');
    this.selectedId.set(null);
    this.formModel = this.createEmptyTransaction();
    this.submitted.set(false);
    this.formErrorMessage.set('');
    this.formOpen.set(true);
  }

  protected startEdit(t: TransactionResponse) {
    this.formMode.set('edit');
    this.selectedId.set(t.id);
    this.formModel = {
      accountId: t.accountId,
      transactionType: t.transactionType,
      amount: t.amount,
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
    const body: TransactionRequest = { ...this.formModel };

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

  protected deleteTransaction(t: TransactionResponse) {
    if (!confirm('¿Eliminar movimiento?')) {
      return;
    }

    this.api.delete(t.id).subscribe({
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

  protected toggleSort(key: 'id' | 'date' | 'transactionType' | 'amount' | 'balance' | 'accountId' | 'accountNumber') {
    if (this.sortKey() === key) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
      return;
    }

    this.sortKey.set(key);
    this.sortDir.set('asc');
  }

  protected sortLabel(key: 'id' | 'date' | 'transactionType' | 'amount' | 'balance' | 'accountId' | 'accountNumber') {
    if (this.sortKey() !== key) {
      return '';
    }

    return this.sortDir() === 'asc' ? ' ↑' : ' ↓';
  }

  private loadList() {
    this.api.list().subscribe({
      next: (txs) => {
        this.transactions.set(txs);
        this.errorMessage.set('');
      },
      error: (err) => {
        this.errorMessage.set(getApiErrorMessage(err));
      },
    });

    this.accountsApi.list().subscribe({
      next: (accounts) => {
        this.accounts.set(accounts);
      },
      error: () => {
        this.accounts.set([]);
      },
    });
  }

  private createEmptyTransaction(): TransactionRequest {
    return {
      accountId: 0,
      transactionType: 'DEBITO',
      amount: 0,
    };
  }
}
