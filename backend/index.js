/* 
    * Proyecto: InnovaTube
    * Archivo: index.js
    * Descripcion: Servidor Básico
    * Author: Daniel Meza
 */

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt'); // para encriptar las contraseñas de forma segura

// Inicializar la app de Express
const app = express();
// Para que el front en mi localhost, pueda hablar con este servidor
app.use(cors());
// App para recibir los datos de registro y login del front
app.use(express.json());

// --- Base de Datos Simulada para pruebas... ---
// TODO: Ralizar la BAse de datos real para el proyecto
const users = [];

// --- Rutas ---

// Ruta de prueba con mensjae de bienvenida
// Se pryeba que en el navegador se vea el mensaje
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

// --- Iniciar el Servidor ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto http://localhost:${PORT}`);
});