export interface Transaction {
  id?: string;
  date: string; // ISO format: YYYY-MM-DD
  amount: number;
  category: string;
  type: 'INCOME' | 'EXPENSE';
  description: string;
}

export interface TransactionSummary {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  transactionCount: number;
}
