import { Injectable, inject } from '@angular/core';
import { Observable} from 'rxjs';
import { Video } from './models/video.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api'; // URL del backend

  // getVideos ahora llama directo a la API
  getVideos(searchTerm: string): Observable<Video[]> {
    // Da un término de búsqueda por defecto si está vacío,
    // para que la página cargue con videos.
    const query = searchTerm || 'Angular'; 
    return this.http.get<Video[]>(`${this.apiUrl}/search`, {
      params: { q: query }
    });
  }

  // getFavorites ahora llama directo a la API
  getFavorites(searchTerm: string): Observable<Video[]> {
    return this.http.get<Video[]>(`${this.apiUrl}/favorites`, {
      params: { q: searchTerm }
    });
  }

  // toggleFavorite devuelve el Observable
  toggleFavorite(video: Video): Observable<any> {
    const newFavoriteState = !video.isFavorite;

    // Actualización optimista (para la UI instantánea)
    // Se muta el objeto 'video' que está en el componente
    video.isFavorite = newFavoriteState; 

    if (newFavoriteState) {
      // AÑADIR a favoritos
      const { isFavorite, ...videoData } = video;
      return this.http.post(`${this.apiUrl}/favorites`, videoData);
    } else {
      // QUITAR de favoritos
      return this.http.delete(`${this.apiUrl}/favorites/${video.id}`);
    }
  }
}

