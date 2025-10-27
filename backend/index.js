/* 
    * Proyecto: InnovaTube
    * Archivo: index.js
    * Descripcion: Servidor Básico
    * Author: Daniel Meza
 */
require('dotenv').config(); // Carga las variables de entorno desde el archivo .env
// Permite configurar la aplicación mediante variables de entorno
const authMiddleware = require('./authMiddleware');// Se importa el middleware
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt'); // para encriptar las contraseñas de forma segura
const jwt = require('jsonwebtoken'); // estandar para manejar sesiones de usuario en APIs
// Token JWT (un string encriptado que contiene la info del usuario) y se lo envía de vuelta a Angular.
const axios = require('axios');// Para hacer peticiones HTTP a la API de Google.

// Inicializar la app de Express
const app = express();
// Para que el front en mi localhost, pueda hablar con este servidor
app.use(cors());
// App para recibir los datos de registro y login del front
app.use(express.json());

// --- Secreto para JWT ---
// Se cambia el string hardcodeado por la variable de entorno
const JWT_SECRET = process.env.JWT_SECRET;

// Asegurarse de que JWT_SECRET exista
if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET no está definida en el archivo .env");
  process.exit(1); // Se detendra la aplicación si el secreto no está
}

// --- Base de Datos Simulada para pruebas... ---
// TODO: Realizar la BAse de datos real para el proyecto
const users = [];
// --- Base de Datos Simulada para Favoritos ---
// Usarun objeto donde la 'key' es el userId
// { 1: [videoObj1, videoObj2], 2: [videoObj3] }
let userFavorites = {};

// --- Rutas ---
// OBTENER favoritos del usuario logueado
app.get('/api/favorites', authMiddleware, (req, res) => {
  const userId = req.user.userId;
  const searchTerm = (req.query.q || '').toLowerCase();

  let favorites = userFavorites[userId] || [];

  // Se filtra por el término de búsqueda (si existe)
  if (searchTerm) {
    favorites = favorites.filter(
      (v) =>
        v.title.toLowerCase().includes(searchTerm) ||
        v.channelTitle.toLowerCase().includes(searchTerm)
    );
  }

  console.log(`Petición GET /api/favorites para userId: ${userId}`);
  res.json(favorites);
});

// AÑADIR un favorito
app.post('/api/favorites', authMiddleware, (req, res) => {
  const userId = req.user.userId;
  const video = req.body; // El objeto de video (id, title, etc.)

  if (!video || !video.id) {
    return res.status(400).json({ error: 'Datos de video inválidos' });
  }

  // Iniciliza el array si es el primer favorito
  if (!userFavorites[userId]) {
    userFavorites[userId] = [];
  }

  // Evitar duplicados
  const exists = userFavorites[userId].find(v => v.id === video.id);
  if (!exists) {
    userFavorites[userId].push(video);
  }
  
  console.log(`Petición POST /api/favorites para userId: ${userId}`);
  res.status(201).json(video); // 201 Created
});

// QUITAR un favorito
app.delete('/api/favorites/:videoId', authMiddleware, (req, res) => {
  const userId = req.user.userId;
  const { videoId } = req.params;

  if (!userFavorites[userId]) {
    // Si no tiene favoritos, no hay nada que borrar
    return res.status(204).send(); // 204 No Content
  }

  // Filtrar la lista, quitando el video
  userFavorites[userId] = userFavorites[userId].filter(v => v.id !== videoId);

  console.log(`Petición DELETE /api/favorites/${videoId} para userId: ${userId}`);
  res.status(204).send(); // 204 No Content
});

// --- Endpoint para Registro de Usuario ---
app.post('/api/register', async (req, res) => {
  console.log('Recibida petición a /api/register');
  console.log('Datos recibidos:', req.body);

  try {
    const { nombreApellido, username, email, password } = req.body;

    //  Validar si el usuario ya existe
    const existingUser = users.find(
      (u) => u.username === username || u.email === email
    );
    if (existingUser) {
      console.log('Error: El usuario o correo ya existe');
      // si aparece error 409 Conflict: El recurso ya existe
      return res.status(409).json({ error: 'El usuario o correo ya existe' });
    }

    // Hashear la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear y guardar el nuevo usuario
    const newUser = {
      id: users.length + 1,
      nombreApellido,
      username,
      email,
      password: hashedPassword, // Se guarda la contraseña "hasheada"
    };
    users.push(newUser);

    console.log('Usuario registrado con éxito:', newUser);
    console.log('--- Base de datos actual ---', users);

    // Se debe responder al frontend
    // mensaje 201 Created: Se creo un nuevo recurso
    res.status(201).json({ message: 'Usuario registrado con éxito' });

  } catch (error) {
    console.error('Error interno del servidor:', error);
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
});

// --- Endpoint de Login de Usuario ---
app.post('/api/login', async (req, res) => {
  console.log('Recibida petición a /api/login');
  try {
    const { usernameOrEmail, password } = req.body;

    // Buscar al usuario por username O email
    const user = users.find(
      (u) => u.username === usernameOrEmail || u.email === usernameOrEmail
    );

    // SI no se encuentra el usuario, responder con error
    if (!user) {
      console.log('Error: Credenciales inválidas (usuario no encontrado)');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Se comparara la contraseña del formulario con la hasheada
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      console.log('Error: Credenciales inválidas (contraseña no coincide)');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Al ser exitoso, crear el Token JWT
    // El token "firmado" contiene el ID y username del usuario
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' } // El token expira en 1 hora
    );

    console.log('Login exitoso para:', user.username);

    // Enviar el token y datos del usuario al frontend
    res.json({
      message: 'Login exitoso',
      token: token,
      username: user.username,
      nombreApellido: user.nombreApellido,
    });

  } catch (error) {
    console.error('Error interno del servidor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// --- Endpoint de Búsqueda de YouTube (Protegida) ---
app.get('/api/search', authMiddleware, async (req, res) => {
  // Se obtiene el término de búsqueda (query param)
  const searchTerm = req.query.q;

  if (!searchTerm) {
    return res.status(400).json({ error: 'Se requiere un término de búsqueda (q)' });
  }

  console.log(`Petición GET /api/search con q=${searchTerm}`);

  const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';
  const API_KEY = process.env.YOUTUBE_API_KEY;

  // ---  LÍNEA DE PRUEBA ---
  console.log('Clave de API que se está usando:', API_KEY);

  try {
    // Se obtiene los favoritos del usuario ANTES de buscar
    const userId = req.user.userId;
    const userFavs = userFavorites[userId] || [];
    const favoriteIds = new Set(userFavs.map(v => v.id)); // Un Set para búsqueda rápida

    // ... (Llamada a axios.get(YOUTUBE_API_URL, ...))
    const response = await axios.get(YOUTUBE_API_URL, {
      params: {
        part: 'snippet',
        q: searchTerm,
        key: API_KEY,  //se envía la clave a Google
        type: 'video',
        maxResults: 10,
      }
    });

    // Se formatea la respuesta de YouTube
    // Se simplifica la respuesta de google
    // para que coincida con el modelo 'Video' del frontend
    const videos = response.data.items.map((item) => {
      const videoId = item.id.videoId;
      return {
        id: item.id.videoId, // ID del video
        title: item.snippet.title, // Título
        thumbnailUrl: item.snippet.thumbnails.medium.url, // Miniatura
        channelTitle: item.snippet.channelTitle, // Nombre del canal
        // Sincronizar 'isFavorite' basado en los favoritos del usuario
        isFavorite: favoriteIds.has(videoId),
      };
    });

    // Se envian los videos formateados al frontend
    res.json(videos);

  } catch (error) {
    console.error('Error al buscar en YouTube:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error al contactar la API de YouTube' });
  }
});

// --- Iniciar el Servidor ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto http://localhost:${PORT}`);
});