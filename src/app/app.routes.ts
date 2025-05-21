import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'processes',
    loadComponent: () => import('./processes/processes.component').then(m => m.ProcessesComponent)
  },
  {
    path: 'analysis',
    loadComponent: () => import('./analysis/analysis.component').then(m => m.AnalysisComponent)
  },
  {
    path: 'database',
    loadComponent: () => import('./database/database.component').then(m => m.DatabaseComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];