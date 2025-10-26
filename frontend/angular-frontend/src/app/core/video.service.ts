import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, map } from 'rxjs';
import { Video } from './models/video.model';

// -- DATOS DE PRUEBA SIMULANDO RESPUESTA DE YOUTUBE -- 
const MOCK_VIDEOS: Video[] = [
  {
    id: 'gXbPl3-qXyY',
    title: 'Angular en 100 Segundos',
    channelTitle: 'Fireship',
    thumbnailUrl: 'https://img.youtube.com/vi/gXbPl3-qXyY/mqdefault.jpg',
    isFavorite: false,
  },
  {
    id: 'f-hpoIfsVjY',
    title: 'Conoce mi canal en YouTube',
    channelTitle: 'Meza Technology', // Un guiño a mi canal en youtube 😉
    thumbnailUrl: 'https://img.youtube.com/vi/f-hpoIfsVjY/mqdefault.jpg',
    isFavorite: true, // Marcado como favorito por defecto
  },
  {
    id: '3qBXWUpoPHo',
    title: 'Node.js en 100 Segundos',
    channelTitle: 'Fireship',
    thumbnailUrl: 'https://img.youtube.com/vi/3qBXWUpoPHo/mqdefault.jpg',
    isFavorite: false,
  },
  {
    id: 'u-y_g2hOar8',
    title: 'Aprende Django en 3 horas (Curso Completo)',
    channelTitle: 'freeCodeCamp Español',
    thumbnailUrl: 'https://img.youtube.com/vi/u-y_g2hOar8/mqdefault.jpg',
    isFavorite: false,
  },
  {
    id: 'vLqTf2b6GjI',
    title: 'Tutorial de PostgreSQL para Principiantes',
    channelTitle: 'freeCodeCamp Español',
    thumbnailUrl: 'https://img.youtube.com/vi/vLqTf2b6GjI/mqdefault.jpg',
    isFavorite: false,
  },
];

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  // BehaviorSubject para mantener la lista de videos "en memoria"
  private videos$ = new BehaviorSubject<Video[]>(MOCK_VIDEOS);

  constructor() {}

  // Obtiene videos, simulando un buscador
  getVideos(searchTerm: string): Observable<Video[]> {
    const term = searchTerm.toLowerCase();
    
    return this.videos$.pipe(
      map((videos) => {
        if (!term) {
          return videos; // Si no hay búsqueda, devuelve todo
        }
        // Simulación de búsqueda por título o canal
        return videos.filter(
          (v) =>
            v.title.toLowerCase().includes(term) ||
            v.channelTitle.toLowerCase().includes(term)
        );
      })
    );
  }

  // Obtiene solo los favoritos 
  getFavorites(searchTerm: string): Observable<Video[]> {
    return this.getVideos(searchTerm).pipe(
      map((videos) => videos.filter((v) => v.isFavorite))
    );
  }

  // Lógica para marcar/desmarcar como favorito
  toggleFavorite(videoId: string) {
    const currentVideos = this.videos$.value;
    const updatedVideos = currentVideos.map((v) => {
      if (v.id === videoId) {
        // Devuelve una NUEVA copia del objeto con el estado cambiado
        return { ...v, isFavorite: !v.isFavorite };
      }
      return v;
    });
    // Emite la nueva lista actualizada
    this.videos$.next(updatedVideos);
  }
}