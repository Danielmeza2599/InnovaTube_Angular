import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

// 'providedIn: root' significa que este servicio será una instancia única en toda la aplicación
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // El BehaviorSubject sirve para que los componentes puedan suscribirse
  // y reaccionar a los cambios de autenticación.
  // Se guarda el nombre de usuario o null si no hay sesión
  private currentUser = new BehaviorSubject<string | null>(null);
  
  // Exponer el usuario actual como un Observable
  public currentUser$ = this.currentUser.asObservable();

   // Se inyecta el Router de Angular para poder navegar entre páginas
  constructor(private router: Router) {
    // Al iniciar el servicio, se revisa si hay un usuario en localStorage
    // para simular una sesión persistente
    // Esto permite que el usuario mantenga la sesión al recargar la página
    const storedUser = localStorage.getItem('fake_user');
    if (storedUser) {
      // Si se encuentra un usuario guardado, se actualiza el BehaviorSubject
      // para que todos los componentes suscritos sepan que hay una sesión activa
      this.currentUser.next(storedUser);
    }
  }

  // Método 'get' para saber si está autenticado (para el Guard)
  // Los Guards de ruta usarán esta propiedad para proteger las paginas privadas
  get isAuthenticated(): boolean {
    return this.currentUser.value !== null;
  }

  // Método para el Login
  // Simula el proceso de login en una aplicación real
  login(username: string) {
    const fakeUsername = username.split('@')[0]; // Simulación
    // Se guarda el usuario en el localStorage del navegador
    // Esto hace que la sesión persista aunque el usuario cierre el navegador
    localStorage.setItem('fake_user', fakeUsername);
    this.currentUser.next(fakeUsername);
    this.router.navigate(['/app']); // Redirigir a la app principal
  }

  // Método para el Logout
  // Cierra la sesión del usuario actual
  logout() {
    // Se elimina al usuario del localStorage
    localStorage.removeItem('fake_user');
    // Se establece el usuario actual como null para indicar que no hay sesión
    this.currentUser.next(null);
    this.router.navigate(['/login']); // Redirigir al login
  }
}