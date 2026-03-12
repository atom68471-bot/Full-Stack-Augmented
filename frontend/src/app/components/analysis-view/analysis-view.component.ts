import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { TransactionSummary, AnalysisResponse } from '../../models/transaction.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChartConfiguration } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-analysis-view',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  template: `
    <div>
      <h2>Monthly Analysis</h2>

      <div class="filters">
        <div class="filter-group">
          <label for="month">Month:</label>
          <select [(ngModel)]="selectedMonth" class="form-control">
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="year">Year:</label>
          <input type="number" 
                 [(ngModel)]="selectedYear" 
                 class="form-control"
                 min="2020"
                 [max]="currentYear">
        </div>

        <button (click)="loadAnalysis()" class="btn btn-primary">Run Analysis</button>
      </div>

      @if (loading) {
        <p>Loading analysis...</p>
      } @else if (summary) {
        @defer (on immediate) {
          <div class="summary-container">
            <div class="summary-card income">
              <h3>Total Income</h3>
              <p class="amount">{{ '$' + summary.totalIncome.toFixed(2) }}</p>
            </div>

            <div class="summary-card expense">
              <h3>Total Expense</h3>
              <p class="amount">{{ '$' + summary.totalExpense.toFixed(2) }}</p>
            </div>

            <div class="summary-card net" [class.positive]="summary.netAmount >= 0" [class.negative]="summary.netAmount < 0">
              <h3>Net Amount</h3>
              <p class="amount">{{ (summary.netAmount >= 0 ? '+$' : '-$') + Math.abs(summary.netAmount).toFixed(2) }}</p>
            </div>

            <div class="summary-card transactions">
              <h3>Total Transactions</h3>
              <p class="amount">{{ summary.transactionCount }}</p>
            </div>
          </div>
        } @placeholder {
          <div class="placeholder">Loading summary cards...</div>
        }

        @defer (on immediate) {
          <div class="charts-container">
            <div class="chart-wrapper">
              <h3>Income vs Expense</h3>
              <canvas 
                baseChart 
                [type]="'bar'"
                [data]="incomeExpenseChartData"
                [options]="chartOptions"
                [plugins]="chartPlugins">
              </canvas>
            </div>
          </div>
        } @placeholder {
          <div class="placeholder">Loading charts...</div>
        }

        <div class="insights">
          <h3>Monthly Insights</h3>
          <p>{{ getInsight() }}</p>
          <div *ngIf="analysis?.advice" class="advice">
            <h4>AI Advice</h4>
            <p>{{ analysis?.advice }}</p>
          </div>
        </div>
      } @else {
        <p>Select a month and year to view analysis</p>
      }
    </div>
  `,
  styles: [`
    h2 {
      color: #2c3e50;
      margin-bottom: 2rem;
    }

    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      align-items: flex-end;
      flex-wrap: wrap;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
    }

    .filter-group label {
      margin-bottom: 0.5rem;
      font-weight: bold;
      color: #34495e;
    }

    .form-control {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .btn {
      padding: 0.5rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: bold;
      transition: background-color 0.3s;
    }

    .btn-primary {
      background-color: #3498db;
      color: white;
    }

    .btn-primary:hover {
      background-color: #2980b9;
    }

    .summary-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .summary-card {
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      color: white;
      text-align: center;
    }

    .summary-card h3 {
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .summary-card.income {
      background: linear-gradient(135deg, #27ae60, #2ecc71);
    }

    .summary-card.expense {
      background: linear-gradient(135deg, #e74c3c, #ec7063);
    }

    .summary-card.net {
      background: linear-gradient(135deg, #3498db, #5dade2);
    }

    .summary-card.net.positive {
      background: linear-gradient(135deg, #27ae60, #2ecc71);
    }

    .summary-card.net.negative {
      background: linear-gradient(135deg, #e74c3c, #ec7063);
    }

    .summary-card.transactions {
      background: linear-gradient(135deg, #9b59b6, #af7ac5);
    }

    .amount {
      margin: 0;
      font-size: 2rem;
      font-weight: bold;
    }

    .insights {
      background-color: #ecf0f1;
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid #3498db;
    }

    .insights h3 {
      color: #2c3e50;
      margin-top: 0;
    }

    .insights p {
      color: #34495e;
      line-height: 1.6;
      margin: 0;
    }

    .charts-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .chart-wrapper {
      background-color: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .chart-wrapper h3 {
      color: #2c3e50;
      margin-top: 0;
      text-align: center;
    }

    .placeholder {
      background-color: #ecf0f1;
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
      color: #7f8c8d;
    }
  `]
})
export class AnalysisViewComponent implements OnInit, OnDestroy {
  summary: TransactionSummary | null = null;
  analysis: AnalysisResponse | null = null;
  loading = false;
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  currentYear = new Date().getFullYear();
  Math = Math;
  
  incomeExpenseChartData: any = null;
  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount ($)'
        }
      }
    }
  };
  chartPlugins = [];

  private destroy$ = new Subject<void>();

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.loadAnalysis();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAnalysis(): void {
    this.loading = true;
    this.transactionService.getAnalysis(this.selectedYear, this.selectedMonth)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.analysis = data;
          // mirror summary fields for charts/existing helpers
          this.summary = {
            year: data.year,
            month: data.month,
            totalIncome: data.totalIncome,
            totalExpense: data.totalExpense,
            netAmount: data.netAmount,
            transactionCount: data.transactionCount
          };
          this.prepareChartData();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading analysis:', error);
          this.loading = false;
        }
      });
  }

  private prepareChartData(): void {
    if (!this.summary) return;

    this.incomeExpenseChartData = {
      labels: ['Income', 'Expense'],
      datasets: [
        {
          label: 'Monthly Financial Overview',
          data: [this.summary.totalIncome, this.summary.totalExpense],
          backgroundColor: ['#27ae60', '#e74c3c'],
          borderColor: ['#229954', '#c0392b'],
          borderWidth: 1,
          borderRadius: 4
        }
      ]
    };
  }

  getInsight(): string {
    if (!this.summary) return '';

    const savingsRate = this.summary.totalIncome > 0 
      ? ((this.summary.totalIncome - this.summary.totalExpense) / this.summary.totalIncome * 100).toFixed(1)
      : 0;

    if (this.summary.netAmount > 0) {
      return `Great job! You saved $${this.summary.netAmount.toFixed(2)} this month (${savingsRate}% of income). Keep up the good work!`;
    } else if (this.summary.netAmount < 0) {
      return `You spent $${Math.abs(this.summary.netAmount).toFixed(2)} more than you earned this month. Consider reducing expenses or increasing income.`;
    } else {
      return `Your income and expenses balanced out this month. You broke even with ${this.summary.transactionCount} transactions.`;
    }
  }
}
