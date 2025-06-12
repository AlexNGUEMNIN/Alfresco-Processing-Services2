import { Routes } from "@angular/router";
import { AuthLayoutComponent } from "./layouts/auth-layout/auth-layout.component";
import { MainLayoutComponent } from "./layouts/main-layout/main-layout.component";
import { LoginComponent } from "./auth/login/login.component";

export const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login', component: LoginComponent,
      },
      {
        path: 'verification',
        loadComponent: () => import('./auth/verification/verification.component')
          .then(m => m.VerificationComponent)
      },
      {
        path: 'resetMdp',
        loadComponent: () => import('./auth/resetmdp/resetmdp.component')
          .then(m => m.ResetmdpComponent)
      },
      {
        path: 'emailVerif',
        loadComponent: () => import('./auth/emailverification/emailverification.component')
          .then(m => m.EmailverificationComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    component: MainLayoutComponent,
    // canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      },
      {
        path: 'processes',
        loadComponent: () => import('./processes/processes.component')
          .then(m => m.ProcessesComponent)
      },
      {
        path: 'analysis',
        loadComponent: () => import('./analysis/analysis.component')
          .then(m => m.AnalysisComponent)
      },
      {
        path: 'database',
        loadComponent: () => import('./database/database.component')
          .then(m => m.DatabaseComponent)
      },
      {
        path: 'admin',
        loadComponent: () => import('./admin/admin.component')
          .then(m => m.AdminComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  { path: '**', redirectTo: '/login' }
];