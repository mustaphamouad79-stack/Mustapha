
export type Language = 'en' | 'fr' | 'ar';
export type Theme = 'light' | 'dark';

export interface LedgerEntry {
  id: string;
  product: string;
  price: number;
  paid: number;
  date: string;
}

export interface Client {
  id: string;
  name: string;
  entries: LedgerEntry[];
  createdAt: string;
}

export interface User {
  username: string;
  role: 'admin' | 'user';
}

export interface FinancialStats {
  totalRevenue: number;
  totalPaid: number;
  totalCredit: number;
}
