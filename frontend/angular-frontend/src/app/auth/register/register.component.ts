import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { NgxCaptchaModule } from 'ngx-captcha';
import { HttpClient } from '@angular/common/http'; // Para que Angular pueda hacer peticiones HTTP
import { Router } from '@angular/router';

// TRABAJANDO EN LAS PREUBAS DEL FORMULARIO DE REGISTRO
// Validador personalizado para comparar contraseñas
export function passwordsMatchValidator(
  control: AbstractControl
): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  // Si los controles aún no existen, no hacer nada
  if (!password || !confirmPassword) {
    return null;
  }

  // Si los valores son diferentes, establece un error en 'confirmPassword'
  if (password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordsNotMatching: true });
    return { passwordsNotMatching: true };
  } else {
    // Si eran iguales pero 'confirmPassword' tenía el error, se limpia
    if (confirmPassword.hasError('passwordsNotMatching')) {
      confirmPassword.setErrors(null);
    }
    return null;
  }
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxCaptchaModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  // Llave clave de sitio de Google ReCaptcha
  protected siteKey = '6LeZbvcrAAAAAO4i2uwUxJmsDnM1O-09Xt4fr8wr';

  private fb = inject(FormBuilder); 
  private http = inject(HttpClient); // Inyectar HttpClient
  private router = inject(Router); // Inyectar Router

  registerForm: FormGroup;
  apiError: string | null = null; // Para mostrar errores del backend

  constructor() {
    this.registerForm = this.fb.group(
      {
        // Requisitos del formulario 'Registro de usuario' 
        nombreApellido: ['', [Validators.required, Validators.minLength(3)]],
        username: ['', [Validators.required, Validators.minLength(4)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        recaptcha: ['', [Validators.required]], // Requisito de ReCaptcha 
      },
      {
        // Aplicar el validador personalizado a nivel de FormGroup
        validators: passwordsMatchValidator,
      }
    );
  }

  onSubmit() {
    this.apiError = null; // Para limpiar errores previos
    if (this.registerForm.valid) {
      // Preparar datos para enviar
      // Excluir los campos que el backend no necesita (confirmPassword y recaptcha)
      const { recaptcha, confirmPassword, ...userData } = this.registerForm.value;

      const apiUrl = 'http://localhost:3000/api/register';

      // Hacer la petición POST
      this.http.post(apiUrl, userData).subscribe({
        next: (response) => {
          console.log('Registro exitoso desde el backend:', response);
          // Redirigir al login al hacer el registro exitoso
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Error en el registro:', err);
          // err.error.error viene del JSON que se envia desde el Express
          this.apiError = err.error?.error || 'No se pudo completar el registro. Intenta de nuevo.';
        },
      });

    } else {
      console.log('Formulario Inválido');
      this.registerForm.markAllAsTouched();
    }
  }

  // Metodos 'get' para facilitar el acceso a los controles en el HTML
  get nombreApellido() {
    return this.registerForm.get('nombreApellido');
  }
  get username() {
    return this.registerForm.get('username');
  }
  get email() {
    return this.registerForm.get('email');
  }
  get password() {
    return this.registerForm.get('password');
  }
  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }
  get recaptcha() {
    return this.registerForm.get('recaptcha');
  }
}