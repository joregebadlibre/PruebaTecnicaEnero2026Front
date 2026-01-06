import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CustomersApiService } from '../../core/api/customers-api.service';
import { ReportsApiService } from '../../core/api/reports-api.service';
import { getApiErrorMessage } from '../../core/api/api-error';
import type { AccountReport, AccountStatementReport, CustomerResponse } from '../../core/api/models';

@Component({
  selector: 'app-reports-page',
  imports: [FormsModule],
  template: `
    <section class="page">
      <div class="page__header">
        <h2 class="page__title">Reportes</h2>
        <button class="btn btn--primary" type="button" (click)="downloadPdf()" [disabled]="!canDownloadPdf()">Descargar PDF</button>
      </div>

      <div class="page__toolbar page__toolbar--grid">
        <label class="field">
          <span class="field__label">Cliente</span>
          <input
            class="input"
            type="search"
            placeholder="Buscar por customerId o nombre"
            list="customers"
            [ngModel]="customerQuery()"
            (ngModelChange)="customerQuery.set($event)"
          />
          <datalist id="customers">
            @for (c of filteredCustomerOptions(); track c.id) {
              <option [value]="c.id + ' - ' + c.name"></option>
            }
          </datalist>
        </label>
        <label class="field">
          <span class="field__label">Desde</span>
          <input class="input" type="date" [(ngModel)]="from" />
        </label>
        <label class="field">
          <span class="field__label">Hasta</span>
          <input class="input" type="date" [(ngModel)]="to" />
        </label>
        <button class="btn" type="button" (click)="loadReport()">Consultar</button>
      </div>

      @if (errorMessage()) {
        <div class="muted">{{ errorMessage() }}</div>
      }

      <div class="panel">
        <div class="panel__title">Estado de cuenta</div>
        <div class="panel__body">
          @if (!report()) {
            <div class="muted">Aquí se mostrará el reporte de movimientos según el rango de fechas.</div>
          } @else {
            <div class="muted">Cliente: {{ report()!.customerName }} ({{ report()!.customerId }})</div>
            <div class="muted">Rango: {{ report()!.from }} - {{ report()!.to }}</div>
            <div class="muted">Créditos: {{ report()!.totalCredits }} | Débitos: {{ report()!.totalDebits }}</div>
            <div style="height: 10px"></div>

            @for (a of accounts(); track a.accountId) {
              <div class="muted">Cuenta {{ a.accountNumber }} ({{ a.accountType }}) - Disponible: {{ a.availableBalance }}</div>
              <div class="table" style="margin: 8px 0 16px 0">
                <div class="table__row table__row--head">
                  <div class="table__cell">Fecha</div>
                  <div class="table__cell">Tipo</div>
                  <div class="table__cell">Monto</div>
                  <div class="table__cell">Saldo</div>
                </div>
                @for (t of a.transactions ?? []; track $index) {
                  <div class="table__row">
                    <div class="table__cell">{{ t.date }}</div>
                    <div class="table__cell">{{ t.transactionType }}</div>
                    <div class="table__cell">{{ t.amount }}</div>
                    <div class="table__cell">{{ t.balance }}</div>
                  </div>
                }
              </div>
            }
          }
        </div>
      </div>
    </section>
  `,
})
export class ReportsPageComponent {
  private readonly api = inject(ReportsApiService);
  private readonly customersApi = inject(CustomersApiService);

  protected readonly customerQuery = signal<string>('');
  private readonly customers = signal<CustomerResponse[]>([]);

  customerId: number | null = null;
  from = '';
  to = '';

  protected readonly report = signal<AccountStatementReport | null>(null);
  protected readonly errorMessage = signal<string>('');

  protected readonly accounts = computed<AccountReport[]>(() => this.report()?.accounts ?? []);
  protected readonly canDownloadPdf = computed(() => Boolean(this.report()?.pdfBase64));

  protected readonly filteredCustomerOptions = computed(() => {
    const q = this.customerQuery().trim().toLowerCase();
    const rows = this.customers();
    if (!q) {
      return rows;
    }

    return rows.filter((c) => {
      return String(c.id).includes(q) || c.name.toLowerCase().includes(q);
    });
  });

  constructor() {
    this.loadCustomers();
  }

  protected loadReport() {
    const resolvedCustomerId = this.resolveCustomerId();
    if (resolvedCustomerId == null || !this.from || !this.to) {
      this.errorMessage.set('Debe ingresar customerId o nombre del cliente, desde y hasta.');
      return;
    }

    this.customerId = resolvedCustomerId;

    this.api.getAccountStatement({ customerId: this.customerId, from: this.from, to: this.to }).subscribe({
      next: (report) => {
        this.report.set(report);
        this.errorMessage.set('');
      },
      error: (err) => {
        this.report.set(null);
        this.errorMessage.set(getApiErrorMessage(err));
      },
    });
  }

  private resolveCustomerId(): number | null {
    const q = this.customerQuery().trim();
    if (!q) {
      return null;
    }

    const directId = Number(q);
    if (!Number.isNaN(directId) && Number.isFinite(directId)) {
      return directId;
    }

    const match = /^\s*(\d+)\s*-/.exec(q);
    if (match) {
      return Number(match[1]);
    }

    const needle = q.toLowerCase();
    const matches = this.customers().filter((c) => c.name.toLowerCase().includes(needle));
    if (matches.length === 1) {
      return matches[0].id;
    }

    if (matches.length > 1) {
      this.errorMessage.set('Hay más de un cliente con ese nombre. Especifique el customerId.');
      return null;
    }

    return null;
  }

  private loadCustomers() {
    this.customersApi.list().subscribe({
      next: (customers) => {
        this.customers.set(customers);
      },
      error: () => {
        this.customers.set([]);
      },
    });
  }

  protected downloadPdf() {
    const base64 = this.report()?.pdfBase64;
    if (!base64) {
      return;
    }

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_${this.customerId}_${this.from}_${this.to}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
