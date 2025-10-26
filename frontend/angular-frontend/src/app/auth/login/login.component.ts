import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { RouterModule } from '@angular/router'; // Importar el  RouterModule para el link

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule], // RouterModule añadido
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  loginForm: FormGroup;

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
    if (this.loginForm.valid) {
      console.log('Formulario Válido:', this.loginForm.value);
      // TODO: Agregar la lógica para autenticar contra el backend
      // y en caso de éxito, 
      // TODO: redirigir a la sección principal
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