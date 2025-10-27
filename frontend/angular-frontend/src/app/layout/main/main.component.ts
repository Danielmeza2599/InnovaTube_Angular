import { Component, inject, OnInit} from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterModule } from '@angular/router'; // Para <router-outlet> y routerLink
import { AuthService } from '../../core/auth.service';
import { Observable } from 'rxjs';
import { VideoService } from '../../core/video.service';

// Este componente funciona como el layout principal de la aplicación
// después de que el usuario ha iniciado sesión
@Component({
  selector: 'app-main', // Etiqueta HTML para usar este componente
  standalone: true, // Para indicar que es un componente independiente
  imports: [ RouterModule, AsyncPipe], // Módulos necesarios para el template
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})

export class MainComponent implements OnInit{
  // Se inyecta el servicio de autenticación
  // Es lo equivalente a usar el constructor en componentes no standalone
  private authService = inject(AuthService);
  private videoService = inject(VideoService);

  // Observable para el nombre de usuario
  // Los componentes en el template se suscribirán a este observable
  public username$: Observable<string | null>;

  constructor() {
    // si, se asigna el observable del servicio al observable del componente
    // esto permite que el template reaccione a cambios en el estado de autenticación
    this.username$ = this.authService.currentUser$;
  }

  // Se añade ngOnInit
  ngOnInit(): void {
    // Al cargarse el layout principal, se sincronizan  los favoritos del usuario
    this.videoService.syncFavorites().subscribe({
      next: () => console.log('Favoritos sincronizados con la UI'),
      error: (err) => console.error('Error al sincronizar favoritos:', err)
    });
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