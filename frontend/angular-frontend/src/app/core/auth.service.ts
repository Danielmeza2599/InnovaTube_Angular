import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

// Interface para las credenciales de login
interface LoginCredentials {
  usernameOrEmail: string;
  password: string;
}

// Interface para la respuesta del API
interface AuthResponse {
  message: string;
  token: string;
  username: string;
}

// 'providedIn: root' significa que este servicio será una instancia única en toda la aplicación
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);
  private http = inject(HttpClient);// Inyectar HttpClient

  private apiUrl = 'http://localhost:3000/api';// <-- URL base del API

  // El BehaviorSubject sirve para que los componentes puedan suscribirse
  // y reaccionar a los cambios de autenticación.
  // Se guarda el nombre de usuario o null si no hay sesión
  private currentUser = new BehaviorSubject<string | null>(null);

  // Exponer el usuario actual como un Observable
  public currentUser$ = this.currentUser.asObservable();

  constructor() {
    // Al iniciar, actualizar el estado desde localStorage
    const token = localStorage.getItem('auth_token');
    const username = localStorage.getItem('auth_user');
    if (token && username) {
      this.currentUser.next(username);
    }
  }

  // Actualizar 'isAuthenticated' para que se revise el token
  get isAuthenticated(): boolean {
    return localStorage.getItem('auth_token') !== null;
  }

  // Metodo 'login' actualizado
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        // Se guarda el token y el usuario
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_user', response.username);
        
        // Se actualiza el estado de la app
        this.currentUser.next(response.username);
        
        // Se redirige a 'app'
        this.router.navigate(['/app']);
      })
      // TODO: Manejo de errores en el componente
    );
  }

  // Método 'logout' actualizado
  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    this.currentUser.next(null);
    this.router.navigate(['/login']);
  }
}