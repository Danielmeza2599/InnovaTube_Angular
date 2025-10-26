/* 
    * Proyecto: InnovaTube
    * Archivo: index.js
    * Descripcion: Servidor Básico
    * Author: Daniel Meza
 */

const express = require('express');
const cors = require('cors');

// Inicializar la app de Express
const app = express();

// --- Middlewares  ---

// Para que el front en mi localhost, pueda hablar con este servidor
app.use(cors());

// App para recibir los datos de registro y login del front
app.use(express.json());

// --- Rutas ---

// Ruta de prueba con mensjae de bienvenida
// Se pryeba que en el navegador se vea el mensaje
app.get('/', (req, res) => {
  res.json({ message: '¡Bienvenido a la API de InnovaTube!' });
});

// --- Iniciar el Servidor ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto http://localhost:${PORT}`);
});