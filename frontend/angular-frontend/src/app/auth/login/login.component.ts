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

  constructor() {
    this.loginForm = this.fb.group({
      // Requisitos de 'Inicio de sesión' 
      // De acuerdo al requisito, se puede iniciar sesion con ambas formas
      // Usario o correo electronico

      // --- PRUEBAS -> Valores por defecto
      usernameOrEmail: ['test@usuario.com', [Validators.required]], // <-- Valor por defecto para pruebas
      password: ['123456', [Validators.required]], // <-- Valor por defecto para pruebas
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Formulario Válido:', this.loginForm.value);
      // TODO: Agregar la lógica para autenticar contra el backend
      // y en caso de éxito, 
      // TODO: redirigir a la sección principal
      // --- PRUEBAS ---
      // Simulacion: usamos el 'usernameOrEmail' como nombre de usuario
      this.authService.login(this.loginForm.value.usernameOrEmail);
    } else {
      console.log('Formulario Inválido');
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