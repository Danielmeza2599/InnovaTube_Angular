import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  startWith,
  switchMap,
} from 'rxjs/operators';

import { Video } from '../../core/models/video.model';
import { VideoService } from '../../core/video.service';
import { VideoCardComponent } from '../video-card/video-card.component';


// Este componente muestra una lista de videos con funcionalidad de búsqueda en tiempo real
// Es el componente que coordina entre la UI y los servicios
@Component({
  selector: 'app-video-list',
  standalone: true,
  imports: [
    AsyncPipe, // Para manejar observables en el template con | async
    ReactiveFormsModule, // Para usar formControl en el buscador
    VideoCardComponent, // Componente hijo que muestra cada video individual
  ],
  templateUrl: './video-list.component.html',
  styleUrls: ['./video-list.component.scss'],
})
export class VideoListComponent {
  // Se inyecta el servicio que se comunica con la API de YouTube
  private videoService = inject(VideoService);

  // Control para el buscador [Requisito] campo de búsqueda
  // Cada vez que el usuario escribe, este control emite un nuevo valor
  searchControl = new FormControl('');

  // Observable que reacciona a los cambios del buscador
  // Se actualiza automáticamente cuando el usuario escribe en el buscador
  videos$: Observable<Video[]>;

  constructor() {
    // Se configura el flujo reactivo de búsqueda:
    // Este es el "cerebro" del componente que maneja toda la lógica de búsqueda
    this.videos$ = this.searchControl.valueChanges.pipe(
      // Emite un string vacío al inicio para cargar videos iniciales
      // Sin esto, la lista estaría vacía hasta que el usuario escriba algo
      startWith(''), // Emite un valor inicial para cargar videos al inicio

      // Espera 300ms después del último tecleo antes de procesar
      // se evita hacer muchas peticiones mientras el usuario escribe rápido
      debounceTime(300), // Espera 300ms después de que el usuario deja de teclear

      // Solo emite si el valor es diferente al anterior
      // se evita peticiones duplicadas si el usuario escribe y borra rápidamente
      distinctUntilChanged(), // Solo emite si el valor cambia

      // Convierte el término de búsqueda en una petición HTTP
      // Si llega un nuevo término, cancela la petición anterior
      // esto ayuda a evitar respuestas en desorden
      switchMap((term) => this.videoService.getVideos(term || ''))
    );
  }

  // Método que maneja el evento cuando el usuario hace clic en favorito
  handleToggleFavorite(video: Video) {
    // Se delega la lógica de favoritos al servicio
    // El servicio se encarga de actualizar el estado y persistir en localStorage
    // se ejecute la llamada POST/DELETE
    // La UI ya se actualizó "optimistamente" en el servicio
    this.videoService.toggleFavorite(video).subscribe({
      next: () => console.log('Toggle de favorito exitoso (lista principal)'),
      error: (err) => {
        // Si falla, se revierte el cambio optimista
        console.error('Error en toggle', err);
        video.isFavorite = !video.isFavorite; // Revertir
      }
    });
  }

  // Ayuda a Angular a identificar qué elementos han cambiado en la lista
  trackById(index: number, video: Video): string {
    // Se usa el ID único de YouTube como identificador
    // Esto evita que Angular re-renderice todos los elementos cuando cambia la lista
    return video.id;
  }
}
