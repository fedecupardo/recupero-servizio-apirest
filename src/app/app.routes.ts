import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'posts',
    // Il componente viene scaricato solo quando si visita questa pagina (lazy loading).
    loadComponent: () => import('./pages/post-list/post-list').then((m) => m.PostList),
  },
  {
    path: 'posts/:id',
    loadComponent: () => import('./pages/post-detail/post-detail').then((m) => m.PostDetail),
  },
  // La radice e gli URL non riconosciuti riportano all'elenco.
  { path: '', pathMatch: 'full', redirectTo: 'posts' },
  { path: '**', redirectTo: 'posts' },
];
