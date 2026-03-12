import { Routes } from '@angular/router';
import { TransactionListComponent } from './components/transaction-list/transaction-list.component';
import { TransactionFormComponent } from './components/transaction-form/transaction-form.component';
import { AnalysisViewComponent } from './components/analysis-view/analysis-view.component';

export const routes: Routes = [
  { path: '', redirectTo: '/transactions', pathMatch: 'full' },
  { path: 'transactions', component: TransactionListComponent },
  { path: 'add-transaction', component: TransactionFormComponent },
  { path: 'edit-transaction/:id', component: TransactionFormComponent },
  { path: 'analysis', component: AnalysisViewComponent },
  { path: '**', redirectTo: '/transactions' }
];
