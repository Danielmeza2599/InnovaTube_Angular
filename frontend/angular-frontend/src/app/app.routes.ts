import { Routes } from '@angular/router';

export const routes: Routes = [
  // Ruta para el registro
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  // Ruta para el login
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },

    // TODO: ... ( otras rutas "pendiente ...")

  // redirect si la ruta base está vacía
  // Lo puedo cambiar al login
  {
    path: '',
    redirectTo: 'register',
    pathMatch: 'full',
  },
];