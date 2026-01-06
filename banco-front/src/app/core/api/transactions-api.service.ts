import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { API_CONFIG } from './api.config';
import { TransactionRequest, TransactionResponse } from './models';

@Injectable({ providedIn: 'root' })
export class TransactionsApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  list() {
    return this.http.get<TransactionResponse[]>(`${this.config.baseUrl}/transactions`);
  }

  getById(id: number) {
    return this.http.get<TransactionResponse>(`${this.config.baseUrl}/transactions/${id}`);
  }

  create(body: TransactionRequest) {
    return this.http.post<TransactionResponse>(`${this.config.baseUrl}/transactions`, body);
  }

  update(id: number, body: TransactionRequest) {
    return this.http.put<TransactionResponse>(`${this.config.baseUrl}/transactions/${id}`, body);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.config.baseUrl}/transactions/${id}`);
  }
}
