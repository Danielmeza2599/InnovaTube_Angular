import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Video } from '../../core/models/video.model';

// Este componente representa una tarjeta individual de video
// Muestra la información básica del video y permite interactuar con él
// Es un componente que solo muestra datos y emite eventos
@Component({
  selector: 'app-video-card',
  standalone: true, // No necesita ser declarado en un módulo
  imports: [CommonModule],
  templateUrl: './video-card.component.html', // Vista HTML del componente
  styleUrls: ['./video-card.component.scss'],
})
export class VideoCardComponent {
  // 'required: true' obliga a que el padre siempre pase un video
  // El '!' le dice a TypeScript que confíe en que siempre tendrá valor
  @Input({ required: true }) video!: Video;
  
  // Evento para notificar al padre que se quiere marcar/desmarcar
  // Evento que se emite cuando el usuario hace clic en el botón de favorito
  // Se emite el ID del video para que el padre sepa cuál video modificar
  @Output() onToggleFavorite = new EventEmitter<Video>();

  // Método que se ejecuta cuando el usuario hace clic en el ícono de favorito
  // No modificara el estado directamente, solo notifica al componente padre
  toggleFavorite() {
    this.onToggleFavorite.emit(this.video);
  }
}