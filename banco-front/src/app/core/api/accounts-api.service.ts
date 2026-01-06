import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { API_CONFIG } from './api.config';
import { AccountRequest, AccountResponse } from './models';

@Injectable({ providedIn: 'root' })
export class AccountsApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  list(customerId?: number) {
    return this.http.get<AccountResponse[]>(`${this.config.baseUrl}/accounts`, {
      params: customerId == null ? undefined : { customerId },
    });
  }

  getById(id: number) {
    return this.http.get<AccountResponse>(`${this.config.baseUrl}/accounts/${id}`);
  }

  create(body: AccountRequest) {
    return this.http.post<AccountResponse>(`${this.config.baseUrl}/accounts`, body);
  }

  update(id: number, body: AccountRequest) {
    return this.http.put<AccountResponse>(`${this.config.baseUrl}/accounts/${id}`, body);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.config.baseUrl}/accounts/${id}`);
  }
}
