import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
    title: 'Sign in | Ascendia',
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
    title: 'Create account | Ascendia',
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/user-layout/user-layout.component').then((m) => m.UserLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/user/dashboard/user-dashboard.component').then((m) => m.UserDashboardComponent),
        title: 'Dashboard | Ascendia',
      },
      {
        path: 'my-team',
        loadComponent: () => import('./features/user/my-team/my-team.component').then((m) => m.MyTeamComponent),
        title: 'My Team | Ascendia',
      },
      {
        path: 'my-referrals',
        loadComponent: () =>
          import('./features/user/my-referrals/my-referrals.component').then((m) => m.MyReferralsComponent),
        title: 'My Referrals | Ascendia',
      },
      {
        path: 'payouts',
        loadComponent: () =>
          import('./features/user/payouts/user-payouts.component').then((m) => m.UserPayoutsComponent),
        title: 'Payout History | Ascendia',
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/user/profile/profile.component').then((m) => m.ProfileComponent),
        title: 'Profile | Ascendia',
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
        title: 'Admin Dashboard | Ascendia',
      },
      {
        path: 'zones',
        loadComponent: () => import('./features/admin/zones/zones.component').then((m) => m.ZonesComponent),
        title: 'Zones | Ascendia',
      },
      {
        path: 'stages',
        loadComponent: () => import('./features/admin/stages/stages.component').then((m) => m.StagesComponent),
        title: 'Stages | Ascendia',
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/users.component').then((m) => m.UsersComponent),
        title: 'Users | Ascendia',
      },
      {
        path: 'users/:id',
        loadComponent: () =>
          import('./features/admin/users/user-detail.component').then((m) => m.UserDetailComponent),
        title: 'User Detail | Ascendia',
      },
      {
        path: 'placement-trees',
        loadComponent: () =>
          import('./features/admin/placement-trees/placement-trees.component').then(
            (m) => m.PlacementTreesComponent,
          ),
        title: 'Placement Trees | Ascendia',
      },
      {
        path: 'payouts',
        loadComponent: () =>
          import('./features/admin/payouts/admin-payouts.component').then((m) => m.AdminPayoutsComponent),
        title: 'Payouts | Ascendia',
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/admin/reports/reports.component').then((m) => m.ReportsComponent),
        title: 'Reports | Ascendia',
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
