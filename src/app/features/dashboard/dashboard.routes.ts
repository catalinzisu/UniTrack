import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard').then(m => m.DashboardComponent),
    children: [
      {
        path: '',
        redirectTo: 'subjects',
        pathMatch: 'full'
      },
      {
        path: 'subjects',
        loadComponent: () => import('./subjects/subjects').then(m => m.SubjectsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/profile').then(m => m.ProfileComponent)
      }
    ]
  }
];
