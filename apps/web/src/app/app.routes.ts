import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./posts-page.component').then((m) => m.PostsPageComponent),
  },
];