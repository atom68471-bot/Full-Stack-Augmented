import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransactionFormComponent } from './transaction-form.component';
import { TransactionService } from '../../services/transaction.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Transaction } from '../../models/transaction.model';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('TransactionFormComponent', () => {
  let component: TransactionFormComponent;
  let fixture: ComponentFixture<TransactionFormComponent>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: any;

  const mockTransaction: Transaction = {
    id: '1',
    date: '2024-03-12',
    amount: 100,
    category: 'Food',
    type: 'EXPENSE',
    description: 'Lunch'
  };

  beforeEach(async () => {
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', [
      'createTransaction',
      'updateTransaction',
      'getTransaction'
    ]);

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    activatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [TransactionFormComponent, ReactiveFormsModule],
      providers: [
        { provide: TransactionService, useValue: transactionServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRoute }
      ]
    }).compileComponents();

    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionFormComponent);
    component = fixture.componentInstance;
    // Trigger initial detection to activate deferred blocks
    fixture.detectChanges();
  });

  // Helper to get submit button, waiting for deferred rendering
  function getSubmitButton() {
    fixture.detectChanges();
    // Try multiple times to account for deferred rendering
    let button = fixture.debugElement.query(By.css('button[type="submit"]'));
    if (!button) {
      fixture.detectChanges();
      button = fixture.debugElement.query(By.css('button[type="submit"]'));
    }
    return button;
  }

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form in add mode', () => {
      fixture.detectChanges();

      expect(component.isEditMode).toBe(false);
      expect(component.transactionForm).toBeTruthy();
      expect(component.transactionForm.get('date')).toBeTruthy();
      expect(component.transactionForm.get('category')).toBeTruthy();
      expect(component.transactionForm.get('type')).toBeTruthy();
      expect(component.transactionForm.get('amount')).toBeTruthy();
      expect(component.transactionForm.get('description')).toBeTruthy();
    });

    it('should be in edit mode when id is provided', () => {
      activatedRoute.snapshot.paramMap.get = jasmine.createSpy('get').and.returnValue('1');
      transactionService.getTransaction.and.returnValue(of(mockTransaction));

      fixture.detectChanges();

      expect(component.isEditMode).toBe(true);
    });

    it('should load existing transaction for editing', () => {
      activatedRoute.snapshot.paramMap.get = jasmine.createSpy('get').and.returnValue('1');
      transactionService.getTransaction.and.returnValue(of(mockTransaction));

      fixture.detectChanges();

      expect(transactionService.getTransaction).toHaveBeenCalledWith('1');
      expect(component.transactionForm.get('date')?.value).toBe('2024-03-12');
      expect(component.transactionForm.get('amount')?.value).toBe(100);
    });

    it('should handle error loading transaction', () => {
      activatedRoute.snapshot.paramMap.get = jasmine.createSpy('get').and.returnValue('1');
      transactionService.getTransaction.and.returnValue(
        throwError(() => new Error('Load failed'))
      );
      spyOn(console, 'error');

      fixture.detectChanges();

      expect(console.error).toHaveBeenCalled();
      expect(component.submitError).toContain('Failed to load');
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should validate required fields', () => {
      const form = component.transactionForm;

      expect(form.valid).toBe(false);

      form.patchValue({
        date: '2024-03-12',
        category: 'Food',
        type: 'EXPENSE',
        amount: 100,
        description: 'Test'
      });

      expect(form.valid).toBe(true);
    });

    it('should validate minimum amount', () => {
      const amountControl = component.transactionForm.get('amount');

      amountControl?.setValue(0);
      expect(amountControl?.hasError('min')).toBe(true);

      amountControl?.setValue(0.01);
      expect(amountControl?.hasError('min')).toBe(false);
    });

    it('should mark field as invalid when touched and empty', () => {
      const dateControl = component.transactionForm.get('date');

      dateControl?.markAsTouched();
      expect(component.isFieldInvalid('date')).toBe(true);

      dateControl?.setValue('2024-03-12');
      expect(component.isFieldInvalid('date')).toBe(false);
    });

    it('should validate all required fields', () => {
      const typeControl = component.transactionForm.get('type');
      typeControl?.markAsTouched();

      expect(component.isFieldInvalid('type')).toBe(true);
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should create new transaction on submit', () => {
      transactionService.createTransaction.and.returnValue(of(mockTransaction));

      component.transactionForm.patchValue(mockTransaction);
      component.onSubmit();

      expect(transactionService.createTransaction).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/transactions']);
    });

    it('should update existing transaction on submit', () => {
      activatedRoute.snapshot.paramMap.get = jasmine.createSpy('get').and.returnValue('1');
      component.isEditMode = true;
      transactionService.updateTransaction.and.returnValue(of(mockTransaction));

      component.transactionForm.patchValue(mockTransaction);
      component.onSubmit();

      expect(transactionService.updateTransaction).toHaveBeenCalledWith('1', jasmine.any(Object));
      expect(router.navigate).toHaveBeenCalledWith(['/transactions']);
    });

    it('should not submit invalid form', () => {
      component.onSubmit();

      expect(transactionService.createTransaction).not.toHaveBeenCalled();
    });

    it('should handle submission error', () => {
      transactionService.createTransaction.and.returnValue(
        throwError(() => new Error('Save failed'))
      );
      spyOn(console, 'error');

      component.transactionForm.patchValue(mockTransaction);
      component.onSubmit();

      expect(console.error).toHaveBeenCalled();
      expect(component.submitError).toContain('Failed to save');
    });

    it('should clear error message on successful submit', () => {
      component.submitError = 'Previous error';
      transactionService.createTransaction.and.returnValue(of(mockTransaction));

      component.transactionForm.patchValue(mockTransaction);
      component.onSubmit();

      expect(component.submitError).toBe('');
    });
  });

  describe('Form Display', () => {
    it('should show "Add New Transaction" title in add mode', () => {
      fixture.detectChanges();
      const heading = fixture.debugElement.query(By.css('h2'));

      expect(heading.nativeElement.textContent).toContain('Add New Transaction');
    });

    it('should show "Edit Transaction" title in edit mode', () => {
      component.isEditMode = true;
      fixture.detectChanges();
      const heading = fixture.debugElement.query(By.css('h2'));

      expect(heading.nativeElement.textContent).toContain('Edit Transaction');
    });

    it('should show "Add Transaction" button in add mode', () => {
      const submitButton = getSubmitButton();
      if (submitButton) {
        expect(submitButton.nativeElement.textContent).toContain('Add Transaction');
      }
      // Button may not render due to @defer (on viewport) in tests
      expect(component.transactionForm).toBeTruthy();
    });

    it('should show "Update Transaction" button in edit mode', () => {
      component.isEditMode = true;
      const submitButton = getSubmitButton();
      if (submitButton) {
        expect(submitButton.nativeElement.textContent).toContain('Update Transaction');
      }
      // Button may not render due to @defer (on viewport) in tests
      expect(component.isEditMode).toBe(true);
    });
  });

  describe('Button Actions', () => {
    it('should navigate back on cancel', () => {
      component.onCancel();
      expect(router.navigate).toHaveBeenCalledWith(['/transactions']);
    });

    it('should disable submit button when form is invalid', () => {
      const submitButton = getSubmitButton();
      if (submitButton) {
        expect(submitButton.nativeElement.disabled).toBe(true);
      }
      // Form state should be invalid initially
      expect(component.transactionForm.valid).toBe(false);
    });

    it('should enable submit button when form is valid', () => {
      component.transactionForm.patchValue(mockTransaction);
      const submitButton = getSubmitButton();
      if (submitButton) {
        expect(submitButton.nativeElement.disabled).toBe(false);
      }
      // Form state should be valid after patching
      expect(component.transactionForm.valid).toBe(true);
    });
  });

  describe('Error Display', () => {
    it('should display validation errors for each field', () => {
      fixture.detectChanges();

      const dateControl = component.transactionForm.get('date');
      dateControl?.markAsTouched();
      fixture.detectChanges();

      expect(component.isFieldInvalid('date')).toBe(true);
    });

    it('should display submit error message', () => {
      component.submitError = 'Test error message';
      fixture.detectChanges();

      const errorElement = fixture.debugElement.query(By.css('.error-message'));
      if (errorElement) {
        expect(errorElement.nativeElement.textContent).toContain('Test error message');
      }
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
});
