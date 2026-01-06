import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { API_CONFIG } from './api.config';
import { CustomerRequest, CustomerResponse } from './models';

@Injectable({ providedIn: 'root' })
export class CustomersApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  list() {
    return this.http.get<CustomerResponse[]>(`${this.config.baseUrl}/customers`);
  }

  getById(id: number) {
    return this.http.get<CustomerResponse>(`${this.config.baseUrl}/customers/${id}`);
  }

  create(body: CustomerRequest) {
    return this.http.post<CustomerResponse>(`${this.config.baseUrl}/customers`, body);
  }

  update(id: number, body: CustomerRequest) {
    return this.http.put<CustomerResponse>(`${this.config.baseUrl}/customers/${id}`, body);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.config.baseUrl}/customers/${id}`);
  }

  updateStatus(id: number, active: boolean) {
    return this.http.patch<CustomerResponse>(`${this.config.baseUrl}/customers/${id}/status`, null, {
      params: { active },
    });
  }
}
