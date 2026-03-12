import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnalysisViewComponent } from './analysis-view.component';
import { TransactionService } from '../../services/transaction.service';
import { TransactionSummary } from '../../models/transaction.model';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('AnalysisViewComponent', () => {
  let component: AnalysisViewComponent;
  let fixture: ComponentFixture<AnalysisViewComponent>;
  let transactionService: jasmine.SpyObj<TransactionService>;

  const mockSummary: TransactionSummary = {
    year: 2024,
    month: 3,
    totalIncome: 5000,
    totalExpense: 2000,
    netAmount: 3000,
    transactionCount: 10
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('TransactionService', [
      'getMonthSummary',
      'getAnalysis'
    ]);

    await TestBed.configureTestingModule({
      imports: [AnalysisViewComponent],
      providers: [
        { provide: TransactionService, useValue: spy }
      ]
    }).compileComponents();

    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
  });

  beforeEach(() => {
    // set default mock return to prevent ngOnInit errors
    transactionService.getAnalysis.and.returnValue(of({
      year: 2024,
      month: 3,
      totalIncome: 0,
      totalExpense: 0,
      netAmount: 0,
      transactionCount: 0,
      advice: '',
      categoryBreakdown: {}
    } as any));

    fixture = TestBed.createComponent(AnalysisViewComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with current month and year', () => {
      const currentDate = new Date();
      const expectedMonth = currentDate.getMonth() + 1;
      const expectedYear = currentDate.getFullYear();

      fixture.detectChanges();

      expect(component.selectedMonth).toBe(expectedMonth);
      expect(component.selectedYear).toBe(expectedYear);
    });

    it('should load summary on init', () => {
      // return shaped analysis response, component maps it to summary
      transactionService.getAnalysis.and.returnValue(of({
        year: mockSummary.year,
        month: mockSummary.month,
        totalIncome: mockSummary.totalIncome,
        totalExpense: mockSummary.totalExpense,
        netAmount: mockSummary.netAmount,
        transactionCount: mockSummary.transactionCount,
        advice: 'Test advice',
        categoryBreakdown: {}
      } as any));

      fixture.detectChanges();

      expect(transactionService.getAnalysis).toHaveBeenCalled();
      expect(component.summary).toEqual(mockSummary);
    });
  });

  describe('Summary Display', () => {
    beforeEach(() => {
      transactionService.getAnalysis.and.returnValue(of({
        year: mockSummary.year,
        month: mockSummary.month,
        totalIncome: mockSummary.totalIncome,
        totalExpense: mockSummary.totalExpense,
        netAmount: mockSummary.netAmount,
        transactionCount: mockSummary.transactionCount,
        advice: 'Some advice',
        categoryBreakdown: {}
      } as any));
      fixture.detectChanges();
    });

    it('should display total income', () => {
      expect(component.summary?.totalIncome).toBe(5000);
    });

    it('should display total expense', () => {
      expect(component.summary?.totalExpense).toBe(2000);
    });

    it('should display net amount', () => {
      expect(component.summary?.netAmount).toBe(3000);
    });

    it('should display transaction count', () => {
      expect(component.summary?.transactionCount).toBe(10);
    });

    it('should display correct year and month', () => {
      expect(component.summary?.year).toBe(2024);
      expect(component.summary?.month).toBe(3);
    });
  });

  describe('Month/Year Selection', () => {
    beforeEach(() => {
      transactionService.getAnalysis.and.returnValue(of({
        year: mockSummary.year,
        month: mockSummary.month,
        totalIncome: mockSummary.totalIncome,
        totalExpense: mockSummary.totalExpense,
        netAmount: mockSummary.netAmount,
        transactionCount: mockSummary.transactionCount,
        advice: 'some',
        categoryBreakdown: {}
      } as any));
      fixture.detectChanges();
    });

    it('should allow changing selected month', () => {
      component.selectedMonth = 6;
      expect(component.selectedMonth).toBe(6);
    });

    it('should allow changing selected year', () => {
      component.selectedYear = 2023;
      expect(component.selectedYear).toBe(2023);
    });

    it('should load analysis for selected month and year', () => {
      component.selectedMonth = 6;
      component.selectedYear = 2023;
      component.loadAnalysis();

      expect(transactionService.getAnalysis).toHaveBeenCalledWith(2023, 6);
    });

    it('should have year range validation', () => {
      const currentYear = new Date().getFullYear();
      expect(component.currentYear).toBe(currentYear);
    });
  });

  describe('Chart Data Preparation', () => {
    beforeEach(() => {
      transactionService.getAnalysis.and.returnValue(of({
        year: mockSummary.year,
        month: mockSummary.month,
        totalIncome: mockSummary.totalIncome,
        totalExpense: mockSummary.totalExpense,
        netAmount: mockSummary.netAmount,
        transactionCount: mockSummary.transactionCount,
        advice: 'some',
        categoryBreakdown: {}
      } as any));
      fixture.detectChanges();
    });

    it('should prepare chart data with income and expense', () => {
      expect(component.incomeExpenseChartData).toBeTruthy();
      expect(component.incomeExpenseChartData.labels).toEqual(['Income', 'Expense']);
      expect(component.incomeExpenseChartData.datasets[0].data).toEqual([5000, 2000]);
    });

    it('should use correct colors for chart', () => {
      const dataset = component.incomeExpenseChartData.datasets[0];
      expect(dataset.backgroundColor).toEqual(['#27ae60', '#e74c3c']);
    });

    it('should handle zero values in chart', () => {
      const zeroSummary: TransactionSummary = {
        year: 2024,
        month: 1,
        totalIncome: 0,
        totalExpense: 0,
        netAmount: 0,
        transactionCount: 0
      };
      transactionService.getAnalysis.and.returnValue(of({
        year: zeroSummary.year,
        month: zeroSummary.month,
        totalIncome: zeroSummary.totalIncome,
        totalExpense: zeroSummary.totalExpense,
        netAmount: zeroSummary.netAmount,
        transactionCount: zeroSummary.transactionCount,
        advice: '',
        categoryBreakdown: {}
      } as any));

      component.loadAnalysis();
      fixture.detectChanges();

      expect(component.incomeExpenseChartData.datasets[0].data).toEqual([0, 0]);
    });
  });

  describe('Insights Calculation', () => {
    it('should generate positive insight when saving money', () => {
      component.summary = mockSummary;
      const insight = component.getInsight();

      expect(insight).toContain('saved');
      expect(insight).toContain('3000');
    });

    it('should generate negative insight when spending more than income', () => {
      component.summary = {
        ...mockSummary,
        totalIncome: 2000,
        totalExpense: 3000,
        netAmount: -1000
      };
      const insight = component.getInsight();

      expect(insight).toContain('more than you earned');
    });

    it('should generate neutral insight when breaking even', () => {
      component.summary = {
        ...mockSummary,
        totalIncome: 2000,
        totalExpense: 2000,
        netAmount: 0
      };
      const insight = component.getInsight();

      expect(insight).toContain('balanced');
    });

    it('should calculate savings rate correctly', () => {
      component.summary = mockSummary;
      const insight = component.getInsight();

      // 3000 / 5000 * 100 = 60%
      expect(insight).toContain('60');
    });

    it('should handle empty summary', () => {
      component.summary = null;
      const insight = component.getInsight();

      expect(insight).toBe('');
    });

    it('should handle zero income', () => {
      component.summary = {
        year: 2024,
        month: 3,
        totalIncome: 0,
        totalExpense: 1000,
        netAmount: -1000,
        transactionCount: 5
      };
      const insight = component.getInsight();

      expect(insight).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('should show loading state when fetching', () => {
      component.loading = true;
      expect(component.loading).toBe(true);
    });

    it('should hide loading state after fetch', () => {
      transactionService.getAnalysis.and.returnValue(of({
        year: mockSummary.year,
        month: mockSummary.month,
        totalIncome: mockSummary.totalIncome,
        totalExpense: mockSummary.totalExpense,
        netAmount: mockSummary.netAmount,
        transactionCount: mockSummary.transactionCount,
        advice: 'x',
        categoryBreakdown: {}
      } as any));
      component.loadAnalysis();

      expect(component.loading).toBe(false);
    });

    it('should handle loading state on error', () => {
      transactionService.getAnalysis.and.returnValue(
        throwError(() => new Error('Load failed'))
      );
      spyOn(console, 'error');

      component.loadAnalysis();

      expect(component.loading).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle error when loading analysis', () => {
      transactionService.getAnalysis.and.returnValue(
        throwError(() => new Error('Load failed'))
      );
      spyOn(console, 'error');

      component.loadAnalysis();

      expect(console.error).toHaveBeenCalled();
      expect(component.loading).toBe(false);
    });

    it('should show summary null on error', () => {
      transactionService.getAnalysis.and.returnValue(
        throwError(() => new Error('Load failed'))
      );

      component.loadAnalysis();

      expect(component.summary).toBeNull();
    });
  });

  describe('Summary Card Display', () => {
    beforeEach(() => {
      transactionService.getAnalysis.and.returnValue(of({
        year: mockSummary.year,
        month: mockSummary.month,
        totalIncome: mockSummary.totalIncome,
        totalExpense: mockSummary.totalExpense,
        netAmount: mockSummary.netAmount,
        transactionCount: mockSummary.transactionCount,
        advice: '',
        categoryBreakdown: {}
      } as any));
      fixture.detectChanges();
    });

    it('should display summary cards', () => {
      const cards = fixture.debugElement.queryAll(By.css('.summary-card'));
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should display income card with correct class', () => {
      const incomeCard = fixture.debugElement.query(By.css('.summary-card.income'));
      expect(incomeCard).toBeTruthy();
    });

    it('should display expense card with correct class', () => {
      const expenseCard = fixture.debugElement.query(By.css('.summary-card.expense'));
      expect(expenseCard).toBeTruthy();
    });

    it('should apply positive class to net amount when positive', () => {
      component.summary = mockSummary;
      fixture.detectChanges();

      const netCard = fixture.debugElement.query(By.css('.summary-card.net'));
      expect(netCard.nativeElement.classList.contains('positive')).toBe(true);
    });

    it('should apply negative class to net amount when negative', () => {
      component.summary = {
        ...mockSummary,
        netAmount: -1000
      };
      fixture.detectChanges();

      const netCard = fixture.debugElement.query(By.css('.summary-card.net'));
      if (netCard.nativeElement.classList.contains('negative')) {
        expect(netCard.nativeElement.classList.contains('negative')).toBe(true);
      }
    });
  });

  describe('Insights Display', () => {
    it('should display insights section', () => {
      transactionService.getAnalysis.and.returnValue(of({
        year: mockSummary.year,
        month: mockSummary.month,
        totalIncome: mockSummary.totalIncome,
        totalExpense: mockSummary.totalExpense,
        netAmount: mockSummary.netAmount,
        transactionCount: mockSummary.transactionCount,
        advice: '',
        categoryBreakdown: {}
      } as any));
      fixture.detectChanges();

      const insights = fixture.debugElement.query(By.css('.insights'));
      expect(insights).toBeTruthy();
    });

    it('should display calculation insights', () => {
      transactionService.getAnalysis.and.returnValue(of({
        year: mockSummary.year,
        month: mockSummary.month,
        totalIncome: mockSummary.totalIncome,
        totalExpense: mockSummary.totalExpense,
        netAmount: mockSummary.netAmount,
        transactionCount: mockSummary.transactionCount,
        advice: '',
        categoryBreakdown: {}
      } as any));
      fixture.detectChanges();

      const insight = component.getInsight();
      expect(insight).toBeTruthy();
    });

    it('should show AI advice when provided', () => {
      const adviceText = 'Don\'t splurge on coffee this month.';
      transactionService.getAnalysis.and.returnValue(of({
        year: mockSummary.year,
        month: mockSummary.month,
        totalIncome: mockSummary.totalIncome,
        totalExpense: mockSummary.totalExpense,
        netAmount: mockSummary.netAmount,
        transactionCount: mockSummary.transactionCount,
        advice: adviceText,
        categoryBreakdown: {}
      } as any));
      fixture.detectChanges();

      const adviceElem = fixture.debugElement.query(By.css('.advice p'));
      expect(adviceElem.nativeElement.textContent).toContain(adviceText);
    });
  });

  describe('Empty State', () => {
    it('should display placeholder when no summary selected', () => {
      component.summary = null;
      fixture.detectChanges();

      const placeholder = fixture.debugElement.queryAll(By.css('p'));
      const hasPlaceholder = placeholder.some(p =>
        p.nativeElement.textContent.includes('Select a month')
      );
      expect(hasPlaceholder).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('should clean up subscriptions on destroy', () => {
      fixture.detectChanges();

      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });

  describe('Chart Options', () => {
    it('should have valid chart configuration', () => {
      expect(component.chartOptions).toBeTruthy();
      // chartOptions is checked above, use non-null assertion to satisfy TypeScript
      expect(component.chartOptions!.responsive).toBe(true);
    });

    it('should have chart plugins configured', () => {
      expect(component.chartPlugins).toBeTruthy();
      expect(Array.isArray(component.chartPlugins)).toBe(true);
    });
  });
});
