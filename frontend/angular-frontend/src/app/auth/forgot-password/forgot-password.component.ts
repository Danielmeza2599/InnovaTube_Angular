import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { RouterModule } from '@angular/router'; // Para el enlace de "volver"

// Componente para recuperación de contraseña
// Manejo del formulario donde los usuarios solicitan un enlace de restablecimiento
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  // FormBuilder para crear el formulario reactivo
  private fb = inject(FormBuilder);
  // Formulario que contiene el campo de email con validaciones
  forgotForm: FormGroup;

  // Estado para mostrar el mensaje de éxito
  // Controla la visibilidad del mensaje de éxito
  // Cuando es true, se muestra la confirmación en lugar del formulario
  messageSent = false;

  constructor() {
    // Inicialización del formulario con validaciones
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  // Manejo del envío del formulario cuando el usuario hace clic en "Enviar"
  onSubmit() {
    if (this.forgotForm.valid) {
      console.log(
        'Solicitud de recuperación para:',
        this.forgotForm.value.email
      );
      // TODO: lógica para llamar al backend
      
      // PRUEBAS con simulacion
      // Simula el envío exitoso del correo
      // En producción, esto se activaría después de una respuesta positiva del backend
      this.messageSent = true;
    } else {
      // se marca los campos como "touched" para mostrar errores de validación
      this.forgotForm.markAllAsTouched();
    }
  }

  // Get que sirve para acceder al control del email desde el template
  // Facilita la verificación de estados y errores en la vista HTML
  get email() {
    return this.forgotForm.get('email');
  }
}