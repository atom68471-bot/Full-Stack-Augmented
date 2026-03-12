import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TransactionService } from './transaction.service';
import { Transaction, TransactionSummary } from '../models/transaction.model';

describe('TransactionService', () => {
  let service: TransactionService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8080/api/transactions';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TransactionService]
    });
    service = TestBed.inject(TransactionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('CRUD Operations', () => {
    it('should get all transactions', () => {
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          date: '2024-03-12',
          amount: 100,
          category: 'Food',
          type: 'EXPENSE',
          description: 'Lunch'
        }
      ];

      service.getAllTransactions().subscribe(transactions => {
        expect(transactions.length).toBe(1);
        expect(transactions[0].category).toBe('Food');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockTransactions);
    });

    it('should get single transaction by id', () => {
      const mockTransaction: Transaction = {
        id: '1',
        date: '2024-03-12',
        amount: 100,
        category: 'Food',
        type: 'EXPENSE',
        description: 'Lunch'
      };

      service.getTransaction('1').subscribe(transaction => {
        expect(transaction.id).toBe('1');
        expect(transaction.amount).toBe(100);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTransaction);
    });

    it('should create transaction', () => {
      const newTransaction: Transaction = {
        date: '2024-03-12',
        amount: 100,
        category: 'Food',
        type: 'EXPENSE',
        description: 'Lunch'
      };

      const response: Transaction = { id: '1', ...newTransaction };

      service.createTransaction(newTransaction).subscribe(result => {
        expect(result.id).toBe('1');
        expect(result.category).toBe('Food');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newTransaction);
      req.flush(response);
    });

    it('should update transaction', () => {
      const updatedTransaction: Transaction = {
        id: '1',
        date: '2024-03-12',
        amount: 150,
        category: 'Food',
        type: 'EXPENSE',
        description: 'Lunch upgraded'
      };

      service.updateTransaction('1', updatedTransaction).subscribe(result => {
        expect(result.amount).toBe(150);
        expect(result.description).toBe('Lunch upgraded');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      req.flush(updatedTransaction);
    });

    it('should delete transaction', () => {
      service.deleteTransaction('1').subscribe(() => {
        expect(true).toBe(true);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('Filtering Operations', () => {
    it('should filter transactions by category', () => {
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          date: '2024-03-12',
          amount: 100,
          category: 'Food',
          type: 'EXPENSE',
          description: 'Lunch'
        }
      ];

      service.getTransactionsByCategory('Food').subscribe(transactions => {
        expect(transactions.length).toBe(1);
        expect(transactions[0].category).toBe('Food');
      });

      const req = httpMock.expectOne(req =>
        req.url.includes('/filter/category') && req.params.get('category') === 'Food'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockTransactions);
    });

    it('should filter transactions by date range', () => {
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          date: '2024-03-15',
          amount: 100,
          category: 'Food',
          type: 'EXPENSE',
          description: 'Lunch'
        }
      ];

      service.getTransactionsByDateRange('2024-03-01', '2024-03-31').subscribe(transactions => {
        expect(transactions.length).toBe(1);
      });

      const req = httpMock.expectOne(req =>
        req.url.includes('/filter/date') &&
        req.params.get('startDate') === '2024-03-01' &&
        req.params.get('endDate') === '2024-03-31'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockTransactions);
    });

    it('should filter transactions by type', () => {
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          date: '2024-03-12',
          amount: 5000,
          category: 'Salary',
          type: 'INCOME',
          description: 'Monthly salary'
        }
      ];

      service.getTransactionsByType('INCOME').subscribe(transactions => {
        expect(transactions[0].type).toBe('INCOME');
      });

      const req = httpMock.expectOne(req =>
        req.url.includes('/filter/type') && req.params.get('type') === 'INCOME'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockTransactions);
    });
  });

  describe('Summary Operations', () => {
    it('should get month summary', () => {
      const mockSummary: TransactionSummary = {
        year: 2024,
        month: 3,
        totalIncome: 5000,
        totalExpense: 2000,
        netAmount: 3000,
        transactionCount: 10
      };

      service.getMonthSummary(2024, 3).subscribe(summary => {
        expect(summary.year).toBe(2024);
        expect(summary.month).toBe(3);
        expect(summary.totalIncome).toBe(5000);
        expect(summary.netAmount).toBe(3000);
      });

      const req = httpMock.expectOne(req =>
        req.url.includes('/summary') &&
        req.params.get('year') === '2024' &&
        req.params.get('month') === '3'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockSummary);
    });

    it('should handle empty summary', () => {
      const mockSummary: TransactionSummary = {
        year: 2024,
        month: 1,
        totalIncome: 0,
        totalExpense: 0,
        netAmount: 0,
        transactionCount: 0
      };

      service.getMonthSummary(2024, 1).subscribe(summary => {
        expect(summary.transactionCount).toBe(0);
      });

      const req = httpMock.expectOne(req => req.url.includes('/summary'));
      req.flush(mockSummary);
    });
  });

  describe('AI Analysis Operation', () => {
    it('should request AI analysis and return advice', () => {
      const mockAnalysis = {
        year: 2024,
        month: 3,
        totalIncome: 5000,
        totalExpense: 2000,
        netAmount: 3000,
        transactionCount: 10,
        advice: 'Keep saving and consider investing.',
        categoryBreakdown: { Food: 500, Transport: 400 }
      };

      service.getAnalysis(2024, 3).subscribe(result => {
        expect(result.advice).toContain('saving');
        expect(result.totalIncome).toBe(5000);
      });

      const req = httpMock.expectOne(req =>
        req.url === 'http://localhost:8080/analysis' &&
        req.params.get('year') === '2024' &&
        req.params.get('month') === '3'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockAnalysis);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 error on getTransaction', () => {
      service.getTransaction('999').subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(404);
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/999`);
      req.flush(null, { status: 404, statusText: 'Not Found' });
    });

    it('should handle 400 error on invalid transaction', () => {
      const invalidTransaction: Transaction = {
        date: '2024-03-12',
        amount: -100,
        category: 'Food',
        type: 'EXPENSE',
        description: 'Invalid'
      };

      service.createTransaction(invalidTransaction).subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(400);
        }
      );

      const req = httpMock.expectOne(apiUrl);
      req.flush(null, { status: 400, statusText: 'Bad Request' });
    });
  });
});
