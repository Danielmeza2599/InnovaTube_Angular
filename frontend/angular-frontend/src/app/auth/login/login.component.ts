import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { RouterModule } from '@angular/router'; // Importar el  RouterModule para el link
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule], // RouterModule añadido
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService); // Inyectar Auth Servicios
  loginForm: FormGroup;

  apiError: string | null = null; // <-- Para errores

  constructor() {
    this.loginForm = this.fb.group({
      // Requisitos de 'Inicio de sesión' 
      // De acuerdo al requisito, se puede iniciar sesion con ambas formas
      // Usario o correo electronico
      usernameOrEmail: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit() {
    this.apiError = null; // Limpiar algun error
    if (this.loginForm.valid) {
      // Llamar al servicio de autenticación
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          // El servicio ya maneja la redirección
          console.log('Login exitoso:', response.message);
        },
        error: (err) => {
          console.error('Error en el login:', err);
          this.apiError = err.error?.error || 'Error desconocido. Intenta de nuevo.';
        }
      });

    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  // Getters para el HTML
  get usernameOrEmail() {
    return this.loginForm.get('usernameOrEmail');
  }
  get password() {
    return this.loginForm.get('password');
  }
}