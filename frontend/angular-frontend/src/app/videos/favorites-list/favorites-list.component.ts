import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
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
  private refreshList$ = new BehaviorSubject<void>(undefined);

  constructor() {
    // Se combina el buscador con el "refresh"
    const search$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300)
    );

    // combineLatest se dispara si 'search$' cambia O si 'refreshList$' emite
    this.videos$ = combineLatest([search$, this.refreshList$]).pipe(
      switchMap(([term, _]) => this.videoService.getFavorites(term || ''))
    );
  }

  handleToggleFavorite(video: Video) {
    this.videoService.toggleFavorite(video).subscribe({
      next: () => {
        console.log('Toggle de favorito exitoso (lista favoritos)');
        // Forzar la recarga de la lista
        this.refreshList$.next(); 
      },
      error: (err) => {
        console.error('Error en toggle', err);
        video.isFavorite = !video.isFavorite; // Revertir
      }
    });
  }

 
  trackById(index: number, video: Video): string {
    return video.id;
  }
}