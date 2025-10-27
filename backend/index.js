/* 
 * Proyecto: InnovaTube
 * Archivo: index.js 
 * Descripción: Servidor Básico con base de datos implementada
 * Author: Daniel Meza
*/

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const authMiddleware = require('./authMiddleware');
// Se implementa base de datos con PostgreSQL
const db = require('./db'); // Importo el 'pool' de base de datos

const app = express();
app.use(cors({
  origin: [
    'https://innovatube-angular-1.onrender.com',
    'http://localhost:4200'
  ],
  credentials: true
}));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET no está definida");
  process.exit(1);
}

// --- RUTAS DE FAVORITOS (Ahora con SQL) ---

// Obtengo los favoritos del usuario logueado
app.get('/api/favorites', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const searchTerm = (req.query.q || ''); // 'q' es el query param
  const query = `
    SELECT * FROM favorites 
    WHERE user_id = $1 AND (title ILIKE $2 OR channel_title ILIKE $2)
  `;
  // Uso ILIKE para búsqueda case-insensitive
  const values = [userId, `%${searchTerm}%`];

  try {
    const result = await db.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener favoritos:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Añado un nuevo favorito
app.post('/api/favorites', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const { id, title, thumbnailUrl, channelTitle } = req.body; // 'id' es el video_id

  if (!id) {
    return res.status(400).json({ error: 'Datos de video inválidos' });
  }

  const query = `
    INSERT INTO favorites (user_id, video_id, title, thumbnail_url, channel_title)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (user_id, video_id) DO NOTHING 
    RETURNING *
  `;
  // ON CONFLICT ayuda a evitar duplicados gracias al constraint UNIQUE
  const values = [userId, id, title, thumbnailUrl, channelTitle];

  try {
    const result = await db.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al añadir favorito:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Elimino un favorito
app.delete('/api/favorites/:videoId', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const { videoId } = req.params;

  const query = 'DELETE FROM favorites WHERE user_id = $1 AND video_id = $2';
  const values = [userId, videoId];

  try {
    await db.query(query, values);
    res.status(204).send(); // 204 No Content
  } catch (err) {
    console.error('Error al quitar favorito:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// --- Endpoint para Registro de Usuario (con SQL) ---
app.post('/api/register', async (req, res) => {
  console.log('Recibida petición a /api/register');
  const { nombreApellido, username, email, password } = req.body;

  try {
    // Hasheo la contraseña antes de guardarla
    // usando bcrypt, para mayor seguridad
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Inserto el nuevo usuario en la base de datos
    const query = `
      INSERT INTO users (nombre_apellido, username, email, password)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, email
    `;
    const values = [nombreApellido, username, email, hashedPassword];
    
    const result = await db.query(query, values);
    const newUser = result.rows[0];

    console.log('Usuario registrado con éxito en DB:', newUser);
    res.status(201).json({ message: 'Usuario registrado con éxito' });

  } catch (err) {
    // Manejo el error de usuario/email duplicado
    if (err.code === '23505') { // Código de PostgreSQL para violación de unique
      console.log('Error: El usuario o correo ya existe');
      return res.status(409).json({ error: 'El usuario o correo ya existe' });
    }
    console.error('Error interno del servidor:', err);
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
});

// --- Endpoint de Login de Usuario (con SQL) ---
app.post('/api/login', async (req, res) => {
  console.log('Recibida petición a /api/login');
  try {
    const { usernameOrEmail, password } = req.body;

    // Busco al usuario por username o email
    const query = 'SELECT * FROM users WHERE username = $1 OR email = $1';
    const result = await db.query(query, [usernameOrEmail]);

    if (result.rows.length === 0) {
      console.log('Error: Credenciales inválidas (usuario no encontrado)');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    // Comparo la contraseña proporcionada con el hash guardado
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      console.log('Error: Credenciales inválidas (contraseña no coincide)');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Genero el token JWT si las credenciales son correctas
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('Login exitoso para:', user.username);
    res.json({
      message: 'Login exitoso',
      token: token,
      username: user.username,
      nombreApellido: user.nombre_apellido, // Tomo el nombre de la DB
    });

  } catch (err) {
    console.error('Error interno del servidor:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// --- Endpoint de Búsqueda de YouTube (con SQL) ---
app.get('/api/search', authMiddleware, async (req, res) => {
  const searchTerm = req.query.q;
  if (!searchTerm) {
    return res.status(400).json({ error: 'Se requiere un término de búsqueda (q)' });
  }

  const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';
  const API_KEY = process.env.YOUTUBE_API_KEY; // Se obtiene la llave desde el .env

  try {
    // Obtengo los favoritos del usuario desde la base de datos
    const userId = req.user.userId;
    const favQuery = 'SELECT video_id FROM favorites WHERE user_id = $1';
    const favResult = await db.query(favQuery, [userId]);
    const favoriteIds = new Set(favResult.rows.map(row => row.video_id));

    // Llamo a la API de YouTube
    const response = await axios.get(YOUTUBE_API_URL, {
      params: {
        part: 'snippet',
        q: searchTerm,
        key: API_KEY,
        type: 'video',
        maxResults: 10,
      },
    });

    // Formateo la respuesta manteniendo el estado de favorito
    const videos = response.data.items.map((item) => {
      const videoId = item.id.videoId;
      return {
        id: videoId,
        title: item.snippet.title,
        thumbnailUrl: item.snippet.thumbnails.medium.url,
        channelTitle: item.snippet.channelTitle,
        isFavorite: favoriteIds.has(videoId), // Sincronizo con la DB
      };
    });

    res.json(videos);

  } catch (err) {
    console.error('Error al buscar en YouTube:', err.response?.data || err.message);
    res.status(500).json({ error: 'Error al contactar la API de YouTube' });
  }
});

// --- Inicio el Servidor ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto http://localhost:${PORT}`);
});