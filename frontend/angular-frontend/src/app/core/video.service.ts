import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, map, tap } from 'rxjs';
import { Video } from './models/video.model';
import { HttpClient } from '@angular/common/http';

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
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api'; // URL del backend
  // BehaviorSubject para mantener la lista de videos "en memoria"
  private videos$ = new BehaviorSubject<Video[]>(MOCK_VIDEOS);

  constructor() {
    // Al iniciar el servicio, se cargaran los videos mock
    // (Luego se sincronizaran con los favoritos reales)
    this.videos$.next(MOCK_VIDEOS);
  }

// --- Método para sincronizar favoritos ---
  // Este método pide los favoritos al API y actualiza el estado 'isFavorite'
  // de la lista MOCK
  syncFavorites() {
    return this.http.get<Video[]>(`${this.apiUrl}/favorites`).pipe(
      tap((apiFavorites: Video[]) => {
        // Se obtiene los IDs de los favoritos reales
        const favoriteIds = new Set(apiFavorites.map((v: Video) => v.id));
        
        // Se obtiene la lista actual de videos
        const currentVideos = this.videos$.value;

        // Sincronizamos
        const syncedVideos = currentVideos.map(video => ({
          ...video,
          isFavorite: favoriteIds.has(video.id) // Marcar como favorito si está en la API
        }));

        // Se emite la lista sincronizada
        this.videos$.next(syncedVideos);
      })
    );
  }


  // Obtiene videos (para la lista principal)
  // No cambia, sigue usando el BehaviorSubject
  getVideos(searchTerm: string): Observable<Video[]> {
    const term = searchTerm.toLowerCase();
    
    return this.videos$.pipe(
      map((videos) => {
        if (!term) return videos;
        return videos.filter(
          (v) =>
            v.title.toLowerCase().includes(term) ||
            v.channelTitle.toLowerCase().includes(term)
        );
      })
    );
  }

  // Obtiene solo los favoritos (para la lista de favoritos)
  // No cambia, se sigue usando el BehaviorSubject (que ya está sincronizado)
  getFavorites(searchTerm: string): Observable<Video[]> {
    return this.getVideos(searchTerm).pipe(
      map((videos) => videos.filter((v) => v.isFavorite))
    );
  }

  // --- Lógica para marcar/desmarcar como favorito ---
  toggleFavorite(video: Video) {
    // Actualización Optimista (UI instantánea)
    // Se invierte el estado en nuestra lista local
    const newFavoriteState = !video.isFavorite;
    const currentVideos = this.videos$.value;
    const updatedVideos = currentVideos.map((v) => 
      v.id === video.id ? { ...v, isFavorite: newFavoriteState } : v
    );
    this.videos$.next(updatedVideos); // Se emite para que la UI cambie ya

    // Llamada al API (Persistencia en DB)
    // PD base de datos pendiente aun
    if (newFavoriteState) {
      // Si AHORA es favorito, se a;adira a la DB
      // (Se crea una copia sin 'isFavorite' por si acaso, aunque el backend no lo usa)
      const { isFavorite, ...videoData } = video;
      this.http.post(`${this.apiUrl}/favorites`, videoData)
        .subscribe({
          next: () => console.log(`Video ${video.id} añadido a favoritos`),
          error: (err) => {
            // TODO: Revertir el cambio si falla el API
            console.error('Error al añadir favorito:', err);
          }
        });
    } else {
      // Si AHORA NO es favorito, se borra  de la DB
      this.http.delete(`${this.apiUrl}/favorites/${video.id}`)
        .subscribe({
          next: () => console.log(`Video ${video.id} quitado de favoritos`),
          error: (err) => {
            // TODO: Revertir el cambio si falla el API
            console.error('Error al quitar favorito:', err);
          }
        });
    }
  }
}