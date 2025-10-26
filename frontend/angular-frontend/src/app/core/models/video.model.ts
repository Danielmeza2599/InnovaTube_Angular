// src/app/core/models/video.model.ts

// Esta interfaz define la estructura de un objeto Video en la aplicación
// Sirve para que todos los videos tengan la misma forma
export interface Video {
  // ID único del video en YouTube
  // Ejemplo: "dQw4w9WgXcQ" para el video de "Never Gonna Give You Up"
  id: string; // ID de YouTube

  // Título del video como aparece en YouTube
  // Ejemplo: "Rick Astley - Never Gonna Give You Up (Official Music Video)"
  title: string;

  // URL de la miniatura del video
  // YouTube provee varias calidades: default, medium, high, standard, maxres
  // Ejemplo: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
  thumbnailUrl: string;

  // Nombre del canal que publicó el video
  // Ejemplo: "RickAstleyVEVO"
  channelTitle: string;

  // Bandera que indica si el usuario ha marcado este video como favorito
  // Perimite las preferencias del usuario entre sesiones
  // false por defecto, se cambiara a true cuando el usuario hace clic en "agregar a favoritos"
  isFavorite: boolean;
}