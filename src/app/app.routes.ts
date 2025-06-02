import { Routes } from "@angular/router";
import { inject } from "@angular/core";
import { AuthGuard } from "./core/services/auth.guard";
import { RedirectRouteGuard } from "./core/services/redirect-route.guard";

// Lazy loading pour l'admin si besoin
// import { adminRoutes } from './admin/admin.routes';

export const routes: Routes = [
  { path: "", redirectTo: "/dashboard", pathMatch: "full" },

  // Auth routes
  {
    path: "login",
    loadComponent: () =>
      import("./auth/login/login.component").then((m) => m.LoginComponent),
    canActivate: [RedirectRouteGuard],
  },

  {
    path: "verification",
    loadComponent: () =>
      import("./auth/verification/verification.component").then(
        (m) => m.VerificationComponent
      ),
  },
  {
    path: "resetMdp",
    loadComponent: () =>
      import("./auth/resetmdp/resetmdp.component").then(
        (m) => m.ResetmdpComponent
      ),
  },
  {
    path: "emailVerif",
    loadComponent: () =>
      import("./auth/emailverification/emailverification.component").then(
        (m) => m.EmailverificationComponent
      ),
  },

  // App routes protégées
  {
    path: "dashboard",
    loadComponent: () =>
      import("./dashboard/dashboard.component").then(
        (m) => m.DashboardComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: "processes",
    loadComponent: () =>
      import("./processes/processes.component").then(
        (m) => m.ProcessesComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: "analysis",
    loadComponent: () =>
      import("./analysis/analysis.component").then((m) => m.AnalysisComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "database",
    loadComponent: () =>
      import("./database/database.component").then((m) => m.DatabaseComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "admin",
    loadComponent: () =>
      import("./admin/admin.component").then((m) => m.AdminComponent),
    canActivate: [AuthGuard],
  },
  // { path: 'profil', loadComponent: () => import('./profil/profil.component').then(m => m.ProfilComponent), canActivate: [AuthGuard] },

  // Pages spéciales
  // { path: 'pageNotFound', loadComponent: () => import('./shared/pages/page-not-found.component').then(m => m.PageNotFoundComponent) },
  // { path: 'unauthorized', loadComponent: () => import('./shared/pages/unauthorised.component').then(m => m.UnauthorisedComponent) },

  // Fallback
  { path: "**", redirectTo: "pageNotFound" },
];
