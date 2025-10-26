import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';//  Importar el Guardia 'guard'

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

  // TODO: otras rutas "pendientes"
  // Ruta de coomponente principal
  {
    path: 'app',
    loadComponent: () =>
      import('./layout/main/main.component').then((m) => m.MainComponent),
    canActivate: [authGuard], // Aplicar el Guardian
    
    // --- Rutas Hijas (El "Área de trabajo") ---
    children: [
      // TODO: COMPONENTES PENDIENTES
      // VideoListComponent
      {
        path: 'videos',
        loadComponent: () =>
          import('./videos/video-list/video-list.component').then(
            (m) => m.VideoListComponent
          ),
      }, 
      // FavoritesListComponent --> PENDIENTE
      
      // Redirección por defecto dentro de 'app'
      { path: '', redirectTo: 'videos', pathMatch: 'full' }
    ]
  },

  // TODO: Ruta 'forgot-password' (aun  pendiente)
  {
    path: 'forgot-password',
    redirectTo: 'login',
  },

  // redirect si la ruta base está vacía
  // Lo puedo cambiar al login u otro
  {
    path: '',
    redirectTo: 'app',//  intentara ir a la app
    pathMatch: 'full',
  },

  // Ruta comodín (Wildcard) para error 404
  {
    path: '**',
    redirectTo: 'login', // o mostrar algo como, componente no encontrado
  },
];