import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
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
import { VideoCardComponent } from '../video-card/video-card.component'; // Reutilizar la tarjeta

@Component({
  selector: 'app-favorites-list',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    ReactiveFormsModule,
    VideoCardComponent, // Reutilizar la tarjeta
  ],
  templateUrl: './favorites-list.component.html', // Usar un HTML casi idéntico
  styleUrls: ['./favorites-list.component.scss'], // Y estilos idénticos
})
export class FavoritesListComponent {
  private videoService = inject(VideoService);

  // Requisito: Buscador (también en favoritos)
  searchControl = new FormControl('');

  // Observable que reacciona a los cambios del buscador
  videos$: Observable<Video[]>;

  constructor() {
    this.videos$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      // Llamar al método que solo devuelve favoritos
      switchMap((term) => this.videoService.getFavorites(term || ''))
    );
  }

  // Misma logica, decirle al servicio que cambie el estado
  handleToggleFavorite(videoId: string) {
    this.videoService.toggleFavorite(videoId);
  }

 
  trackById(index: number, video: Video): string {
    return video.id;
  }
}