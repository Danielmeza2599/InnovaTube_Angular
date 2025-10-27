import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Se obtiene el token de localStorage
  const authToken = localStorage.getItem('auth_token');

  // Si no hay token (ej: peticiones de login/register),
  // solo deja pasar la petición original
  if (!authToken) {
    return next(req);
  }

  // Se clona la petición y añadir el header de Autorización
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${authToken}`
    }
  });

  // Se envia la petición clonada (con el header)
  return next(authReq);
};