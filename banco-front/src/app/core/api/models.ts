export interface ApiError {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
}

export interface CustomerRequest {
  name: string;
  gender: string;
  age: number;
  identification: string;
  address: string;
  phone: string;
  password: string;
  active: boolean;
}

export interface CustomerResponse extends CustomerRequest {
  id: number;
}

export type AccountType = 'AHORRO' | 'CORRIENTE';

export interface AccountRequest {
  accountNumber: number;
  accountType: AccountType;
  initialBalance: number;
  active: boolean;
  customerId: number;
}

export interface AccountResponse extends AccountRequest {
  id: number;
}

export type TransactionType = 'CREDITO' | 'DEBITO';

export interface TransactionRequest {
  accountId: number;
  transactionType: TransactionType;
  amount: number;
}

export interface TransactionResponse extends TransactionRequest {
  id: number;
  date: string;
  balance: number;
}

export interface TransactionReport {
  date?: string;
  transactionType?: string;
  amount?: number;
  balance?: number;
}

export interface AccountReport {
  accountId?: number;
  accountNumber?: number;
  accountType?: string;
  initialBalance?: number;
  availableBalance?: number;
  transactions?: TransactionReport[];
}

export interface AccountStatementReport {
  customerId?: number;
  customerName?: string;
  from?: string;
  to?: string;
  accounts?: AccountReport[];
  totalCredits?: number;
  totalDebits?: number;
  pdfBase64?: string;
}
