import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransactionListComponent } from './transaction-list.component';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction.model';
import { of, throwError } from 'rxjs';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

describe('TransactionListComponent', () => {
  let component: TransactionListComponent;
  let fixture: ComponentFixture<TransactionListComponent>;
  let transactionService: jasmine.SpyObj<TransactionService>;

  const mockTransactions: Transaction[] = [
    {
      id: '1',
      date: '2024-03-12',
      amount: 100,
      category: 'Food',
      type: 'EXPENSE',
      description: 'Lunch'
    },
    {
      id: '2',
      date: '2024-03-11',
      amount: 5000,
      category: 'Salary',
      type: 'INCOME',
      description: 'Monthly salary'
    },
    {
      id: '3',
      date: '2024-03-10',
      amount: 50,
      category: 'Transport',
      type: 'EXPENSE',
      description: 'Bus fare'
    }
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('TransactionService', [
      'getAllTransactions',
      'getTransactionsByCategory',
      'getTransactionsByDateRange',
      'deleteTransaction'
    ]);

    await TestBed.configureTestingModule({
      imports: [TransactionListComponent],
      providers: [
        { provide: TransactionService, useValue: spy },
        { provide: ActivatedRoute, useValue: {} }
      ]
    }).compileComponents();

    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
  });

  beforeEach(() => {
    // set default mock return to prevent ngOnInit errors
    transactionService.getAllTransactions.and.returnValue(of([]));

    fixture = TestBed.createComponent(TransactionListComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load all transactions on init', () => {
      transactionService.getAllTransactions.and.returnValue(of(mockTransactions));

      fixture.detectChanges();

      expect(transactionService.getAllTransactions).toHaveBeenCalled();
      expect(component.transactions).toEqual(mockTransactions);
      expect(component.loading).toBe(false);
    });

    it('should initialize with empty transaction list', () => {
      transactionService.getAllTransactions.and.returnValue(of([]));

      fixture.detectChanges();

      expect(component.transactions).toEqual([]);
    });
  });

  describe('Display Transactions', () => {
    beforeEach(() => {
      transactionService.getAllTransactions.and.returnValue(of(mockTransactions));
      fixture.detectChanges();
    });

    it('should display all transactions in table', () => {
      const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
      expect(rows.length).toBe(3);
    });

    it('should display transaction details correctly', () => {
      const firstRow = fixture.debugElement.query(By.css('tbody tr'));
      const cells = firstRow.queryAll(By.css('td'));

      expect(cells[0].nativeElement.textContent).toContain('2024-03-12');
      expect(cells[1].nativeElement.textContent).toContain('Food');
      expect(cells[3].nativeElement.textContent).toContain('100');
    });

    it('should format amount with sign', () => {
      expect(component.formatAmount(mockTransactions[0])).toBe('-$100.00');
      expect(component.formatAmount(mockTransactions[1])).toBe('+$5000.00');
    });

    it('should color code income and expense rows', () => {
      fixture.detectChanges();
      const rows = fixture.debugElement.queryAll(By.css('tbody tr'));

      expect(rows[0].nativeElement.classList.contains('expense')).toBe(true);
      expect(rows[1].nativeElement.classList.contains('income')).toBe(true);
    });
  });

  describe('Filtering Functionality', () => {
    beforeEach(() => {
      transactionService.getAllTransactions.and.returnValue(of(mockTransactions));
      fixture.detectChanges();
    });

    it('should filter transactions by category', () => {
      const categoryTransactions = mockTransactions.filter(t => t.category === 'Food');
      transactionService.getTransactionsByCategory.and.returnValue(of(categoryTransactions));

      component.categoryFilter = 'Food';
      component.filterByCategory();

      expect(transactionService.getTransactionsByCategory).toHaveBeenCalledWith('Food');
      expect(component.transactions).toEqual(categoryTransactions);
    });

    it('should reload all transactions when category filter is empty', () => {
      component.categoryFilter = '';
      component.filterByCategory();

      expect(transactionService.getAllTransactions).toHaveBeenCalled();
    });

    it('should filter transactions by date range', () => {
      const rangeTransactions = mockTransactions.slice(0, 2);
      transactionService.getTransactionsByDateRange.and.returnValue(of(rangeTransactions));

      component.startDate = '2024-03-11';
      component.endDate = '2024-03-12';
      component.filterByDateRange();

      expect(transactionService.getTransactionsByDateRange).toHaveBeenCalledWith('2024-03-11', '2024-03-12');
      expect(component.transactions).toEqual(rangeTransactions);
    });

    it('should show alert when date range is incomplete', () => {
      spyOn(window, 'alert');
      component.startDate = '';
      component.endDate = '2024-03-12';
      component.filterByDateRange();

      expect(window.alert).toHaveBeenCalledWith('Please select both start and end dates');
    });

    it('should clear filters and reload all transactions', () => {
      component.categoryFilter = 'Food';
      component.startDate = '2024-03-01';
      component.endDate = '2024-03-31';
      transactionService.getAllTransactions.and.returnValue(of(mockTransactions));

      component.loadTransactions();

      expect(component.categoryFilter).toBe('');
      expect(component.startDate).toBe('');
      expect(component.endDate).toBe('');
      expect(transactionService.getAllTransactions).toHaveBeenCalled();
    });
  });

  describe('Delete Functionality', () => {
    beforeEach(() => {
      transactionService.getAllTransactions.and.returnValue(of(mockTransactions));
      fixture.detectChanges();
    });

    it('should delete transaction when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      transactionService.deleteTransaction.and.returnValue(of(void 0));
      transactionService.getAllTransactions.and.returnValue(of(mockTransactions.slice(1)));

      component.deleteTransaction('1');

      expect(window.confirm).toHaveBeenCalled();
      expect(transactionService.deleteTransaction).toHaveBeenCalledWith('1');
      expect(transactionService.getAllTransactions).toHaveBeenCalled();
    });

    it('should not delete transaction when cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.deleteTransaction('1');

      expect(transactionService.deleteTransaction).not.toHaveBeenCalled();
    });

    it('should handle delete error gracefully', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      transactionService.deleteTransaction.and.returnValue(throwError(() => new Error('Delete failed')));
      spyOn(console, 'error');

      component.deleteTransaction('1');

      expect(console.error).toHaveBeenCalled();
    });

    it('should not delete transaction with undefined id', () => {
      component.deleteTransaction(undefined);
      expect(transactionService.deleteTransaction).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle error when loading transactions', () => {
      transactionService.getAllTransactions.and.returnValue(
        throwError(() => new Error('Loading failed'))
      );
      spyOn(console, 'error');

      component.loadTransactions();

      expect(console.error).toHaveBeenCalled();
      expect(component.loading).toBe(false);
    });

    it('should handle error when filtering by category', () => {
      transactionService.getTransactionsByCategory.and.returnValue(
        throwError(() => new Error('Filter failed'))
      );
      spyOn(console, 'error');

      component.categoryFilter = 'Food';
      component.filterByCategory();

      expect(console.error).toHaveBeenCalled();
      expect(component.loading).toBe(false);
    });

    it('should handle error when filtering by date range', () => {
      transactionService.getTransactionsByDateRange.and.returnValue(
        throwError(() => new Error('Date filter failed'))
      );
      spyOn(console, 'error');

      component.startDate = '2024-03-01';
      component.endDate = '2024-03-31';
      component.filterByDateRange();

      expect(console.error).toHaveBeenCalled();
      expect(component.loading).toBe(false);
    });
  });

  describe('Loading State', () => {
    it('should show loading state when fetching transactions', () => {
      transactionService.getAllTransactions.and.returnValue(of(mockTransactions));

      component.loadTransactions();

      expect(component.loading).toBe(false);
    });

    it('should display loading message while fetching', () => {
      transactionService.getAllTransactions.and.returnValue(of(mockTransactions));
      component.loading = true;
      fixture.detectChanges();

      const loadingMessage = fixture.debugElement.query(By.css('*'));
      expect(loadingMessage).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('should display message when no transactions exist', () => {
      transactionService.getAllTransactions.and.returnValue(of([]));
      fixture.detectChanges();
      component.transactions = [];
      fixture.detectChanges();

      const emptyMessage = fixture.debugElement.query(By.css('p'));
      expect(emptyMessage).toBeTruthy();
    });
  });

  describe('Cleanup', () => {
    it('should clean up subscriptions on destroy', () => {
      transactionService.getAllTransactions.and.returnValue(of(mockTransactions));
      fixture.detectChanges();

      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });
});
