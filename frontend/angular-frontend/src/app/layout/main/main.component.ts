import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterModule } from '@angular/router'; // Para <router-outlet> y routerLink
import { AuthService } from '../../core/auth.service';
import { Observable } from 'rxjs';

// Este componente funciona como el layout principal de la aplicación
// después de que el usuario ha iniciado sesión
@Component({
  selector: 'app-main', // Etiqueta HTML para usar este componente
  standalone: true, // Para indicar que es un componente independiente
  imports: [CommonModule, RouterModule, AsyncPipe], // Módulos necesarios para el template
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})

export class MainComponent {
  // Se inyecta el servicio de autenticación
  // Es lo equivalente a usar el constructor en componentes no standalone
  private authService = inject(AuthService);

  // Observable para el nombre de usuario
  // Los componentes en el template se suscribirán a este observable
  public username$: Observable<string | null>;

  constructor() {
    // si, se asigna el observable del servicio al observable del componente
    // esto permite que el template reaccione a cambios en el estado de autenticación
    this.username$ = this.authService.currentUser$;
  }

  // Método que se ejecuta cuando el usuario hace clic en "Cerrar sesión"
  logout() {
    // Llama al método 'logout' del servicio, que se encarga de:
    // - Limpiar el localStorage
    // - Actualizar el estado de autenticación
    // - Redirigir al usuario a la página de login
    this.authService.logout();
  }
}