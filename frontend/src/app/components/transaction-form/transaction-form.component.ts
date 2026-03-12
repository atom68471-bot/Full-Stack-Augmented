import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div>
      <h2>{{ isEditMode ? 'Edit Transaction' : 'Add New Transaction' }}</h2>
      
      @if (loading) {
        <p>Loading...</p>
      } @else {
        @defer (on viewport) {
          <form [formGroup]="transactionForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="date">Date *</label>
              <input type="date" 
                     id="date" 
                     formControlName="date"
                     class="form-control"
                     required>
              @if (isFieldInvalid('date')) {
                <span class="error">Date is required</span>
              }
            </div>

            <div class="form-group">
              <label for="category">Category *</label>
              <input type="text" 
                     id="category" 
                     formControlName="category"
                     placeholder="e.g., Food, Transport, Salary"
                     class="form-control"
                     required>
              @if (isFieldInvalid('category')) {
                <span class="error">Category is required</span>
              }
            </div>

            <div class="form-group">
              <label for="type">Type *</label>
              <select id="type" 
                      formControlName="type"
                      class="form-control"
                      required>
                <option value="">Select Type</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
              @if (isFieldInvalid('type')) {
                <span class="error">Type is required</span>
              }
            </div>

            <div class="form-group">
              <label for="amount">Amount *</label>
              <input type="number" 
                     id="amount" 
                     formControlName="amount"
                     placeholder="0.00"
                     step="0.01"
                     class="form-control"
                     required>
              @if (isFieldInvalid('amount')) {
                <span class="error">Amount must be greater than 0</span>
              }
            </div>

            <div class="form-group">
              <label for="description">Description *</label>
              <textarea id="description" 
                        formControlName="description"
                        placeholder="Transaction description"
                        class="form-control"
                        rows="3"
                        required></textarea>
              @if (isFieldInvalid('description')) {
                <span class="error">Description is required</span>
              }
            </div>

            <div class="form-actions">
              <button type="submit" 
                      class="btn btn-primary"
                      [disabled]="!transactionForm.valid">
                {{ isEditMode ? 'Update' : 'Add' }} Transaction
              </button>
              <button type="button" 
                      (click)="onCancel()"
                      class="btn btn-secondary">
                Cancel
              </button>
            </div>

            @if (submitError) {
              <div class="error-message">{{ submitError }}</div>
            }
          </form>
        } @placeholder {
          <p>Loading form...</p>
        }
      }
    </div>
  `,
  styles: [`
    h2 {
      color: #2c3e50;
      margin-bottom: 2rem;
    }

    form {
      max-width: 600px;
      margin: 0 auto;
    }

    .form-group {
      margin-bottom: 1.5rem;
      display: flex;
      flex-direction: column;
    }

    label {
      margin-bottom: 0.5rem;
      font-weight: bold;
      color: #34495e;
    }

    .form-control {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      font-family: inherit;
    }

    .form-control:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
    }

    .error {
      color: #e74c3c;
      font-size: 0.9rem;
      margin-top: 0.25rem;
    }

    .error-message {
      background-color: #f8d7da;
      color: #721c24;
      padding: 1rem;
      border-radius: 4px;
      margin-top: 1rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
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

    .btn-primary:hover:not(:disabled) {
      background-color: #2980b9;
    }

    .btn-primary:disabled {
      background-color: #bdc3c7;
      cursor: not-allowed;
    }

    .btn-secondary {
      background-color: #95a5a6;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #7f8c8d;
    }
  `]
})
export class TransactionFormComponent implements OnInit, OnDestroy {
  transactionForm: FormGroup;
  isEditMode = false;
  loading = false;
  submitError = '';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService
  ) {
    this.transactionForm = this.fb.group({
      date: ['', Validators.required],
      category: ['', Validators.required],
      type: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loading = true;
      this.transactionService.getTransaction(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (transaction) => {
            this.transactionForm.patchValue(transaction);
            this.loading = false;
          },
          error: (error) => {
            console.error('Error loading transaction:', error);
            this.submitError = 'Failed to load transaction';
            this.loading = false;
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.transactionForm.get(fieldName);
    return !!(field && field.touched && field.invalid);
  }

  onSubmit(): void {
    if (!this.transactionForm.valid) {
      return;
    }

    this.submitError = '';
    const formData = this.transactionForm.value;

    const request = this.isEditMode
      ? this.transactionService.updateTransaction(
          this.route.snapshot.paramMap.get('id')!,
          formData
        )
      : this.transactionService.createTransaction(formData);

    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.router.navigate(['/transactions']);
      },
      error: (error) => {
        console.error('Error saving transaction:', error);
        this.submitError = 'Failed to save transaction. Please try again.';
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/transactions']);
  }
}
