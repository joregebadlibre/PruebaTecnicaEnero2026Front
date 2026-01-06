import { Routes } from '@angular/router';

import { AccountsPageComponent } from './pages/accounts/accounts-page.component';
import { CustomersPageComponent } from './pages/customers/customers-page.component';
import { ReportsPageComponent } from './pages/reports/reports-page.component';
import { TransactionsPageComponent } from './pages/transactions/transactions-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'clientes' },
  { path: 'clientes', component: CustomersPageComponent },
  { path: 'cuentas', component: AccountsPageComponent },
  { path: 'movimientos', component: TransactionsPageComponent },
  { path: 'reportes', component: ReportsPageComponent },
  { path: '**', redirectTo: 'clientes' },
];
