import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div>
      <h2>Transactions</h2>
      
      <div class="filters">
        <div class="filter-group">
          <input type="text" 
                 [(ngModel)]="categoryFilter" 
                 placeholder="Filter by category"
                 class="filter-input">
          <button (click)="filterByCategory()" class="btn btn-primary">Filter by Category</button>
        </div>

        <div class="filter-group">
          <input type="date" 
                 [(ngModel)]="startDate" 
                 class="filter-input"
                 placeholder="Start Date">
          <input type="date" 
                 [(ngModel)]="endDate" 
                 class="filter-input"
                 placeholder="End Date">
          <button (click)="filterByDateRange()" class="btn btn-primary">Filter by Date</button>
        </div>

        <button (click)="loadTransactions()" class="btn btn-secondary">Clear Filters</button>
      </div>

      @if (loading) {
        <p>Loading transactions...</p>
      } @else if (transactions.length === 0) {
        <p>No transactions found. <a routerLink="/add-transaction">Add one now</a></p>
      } @else {
        @defer (on immediate) {
          <div class="table-responsive">
            <table class="transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (transaction of transactions; track transaction.id) {
                  <tr [class.income]="transaction.type === 'INCOME'" 
                      [class.expense]="transaction.type === 'EXPENSE'">
                    <td>{{ transaction.date }}</td>
                    <td>{{ transaction.category }}</td>
                    <td><span [class]="'badge badge-' + transaction.type.toLowerCase()">
                    {{ transaction.type }}
                  </span></td>
                  <td class="amount">{{ formatAmount(transaction) }}</td>
                  <td>{{ transaction.description }}</td>
                  <td>
                    <a [routerLink]="['/edit-transaction', transaction.id]" class="btn-sm btn-info">Edit</a>
                    <button (click)="deleteTransaction(transaction.id)" class="btn-sm btn-danger">Delete</button>
                  </td>
                </tr>
              }
              </tbody>
            </table>
          </div>
        } @placeholder {
          <p>Loading transaction list...</p>
        }
      }
    </div>
  `,
  styles: [`
    h2 {
      color: #2c3e50;
      margin-bottom: 1.5rem;
    }

    .filters {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .filter-group {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      align-items: center;
    }

    .filter-input {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      flex: 1;
      min-width: 150px;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      transition: background-color 0.3s;
      white-space: nowrap;
    }

    .btn-primary {
      background-color: #3498db;
      color: white;
    }

    .btn-primary:hover {
      background-color: #2980b9;
    }

    .btn-secondary {
      background-color: #95a5a6;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #7f8c8d;
    }

    .table-responsive {
      overflow-x: auto;
      margin-bottom: 2rem;
    }

    .transactions-table {
      width: 100%;
      border-collapse: collapse;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .transactions-table th,
    .transactions-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }

    .transactions-table th {
      background-color: #34495e;
      color: white;
      font-weight: bold;
    }

    .transactions-table tr:hover {
      background-color: #ecf0f1;
    }

    .transactions-table tr.income {
      background-color: #d4edda;
    }

    .transactions-table tr.expense {
      background-color: #f8d7da;
    }

    .amount {
      font-weight: bold;
      font-size: 1.1rem;
    }

    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: bold;
    }

    .badge-income {
      background-color: #27ae60;
      color: white;
    }

    .badge-expense {
      background-color: #e74c3c;
      color: white;
    }

    .btn-sm {
      padding: 0.25rem 0.5rem;
      margin-right: 0.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      font-size: 0.9rem;
    }

    .btn-info {
      background-color: #3498db;
      color: white;
    }

    .btn-danger {
      background-color: #e74c3c;
      color: white;
    }

    .btn-info:hover {
      background-color: #2980b9;
    }

    .btn-danger:hover {
      background-color: #c0392b;
    }
  `]
})
export class TransactionListComponent implements OnInit, OnDestroy {
  transactions: Transaction[] = [];
  loading = false;
  categoryFilter = '';
  startDate = '';
  endDate = '';
  private destroy$ = new Subject<void>();

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTransactions(): void {
    this.loading = true;
    this.categoryFilter = '';
    this.startDate = '';
    this.endDate = '';
    this.transactionService.getAllTransactions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.transactions = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading transactions:', error);
          this.loading = false;
        }
      });
  }

  filterByCategory(): void {
    if (!this.categoryFilter.trim()) {
      this.loadTransactions();
      return;
    }

    this.loading = true;
    this.transactionService.getTransactionsByCategory(this.categoryFilter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.transactions = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error filtering transactions:', error);
          this.loading = false;
        }
      });
  }

  filterByDateRange(): void {
    if (!this.startDate || !this.endDate) {
      alert('Please select both start and end dates');
      return;
    }

    this.loading = true;
    this.transactionService.getTransactionsByDateRange(this.startDate, this.endDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.transactions = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error filtering by date range:', error);
          this.loading = false;
        }
      });
  }

  deleteTransaction(id: string | undefined): void {
    if (!id) return;
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.transactionService.deleteTransaction(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadTransactions();
          },
          error: (error) => {
            console.error('Error deleting transaction:', error);
          }
        });
    }
  }

  formatAmount(transaction: Transaction): string {
    const sign = transaction.type === 'INCOME' ? '+' : '-';
    return `${sign}$${transaction.amount.toFixed(2)}`;
  }
}
