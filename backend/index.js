/* 
    * Proyecto: InnovaTube
    * Archivo: index.js
    * Descripcion: Servidor Básico
    * Author: Daniel Meza
 */
require('dotenv').config(); // Carga las variables de entorno desde el archivo .env
// Permite configurar la aplicación mediante variables de entorno

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt'); // para encriptar las contraseñas de forma segura
const jwt = require('jsonwebtoken'); // estandar para manejar sesiones de usuario en APIs
// Token JWT (un string encriptado que contiene la info del usuario) y se lo envía de vuelta a Angular.

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
// TODO: Ralizar la BAse de datos real para el proyecto
const users = [];

// --- Rutas ---

// Ruta de prueba con mensaje de bienvenida
// Se prueba que en el navegador se vea el mensaje
app.get('/', (req, res) => {
  res.json({ message: '¡Bienvenido a la API de InnovaTube!' });
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

// --- Iniciar el Servidor ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto http://localhost:${PORT}`);
});