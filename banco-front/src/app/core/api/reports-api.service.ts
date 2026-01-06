import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { API_CONFIG } from './api.config';
import { AccountStatementReport } from './models';

@Injectable({ providedIn: 'root' })
export class ReportsApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  getAccountStatement(params: { customerId: number; from: string; to: string }) {
    return this.http.get<AccountStatementReport>(`${this.config.baseUrl}/reports`, {
      params,
    });
  }
}
