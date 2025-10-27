/* 
    * Proyecto: InnovaTube
    * Archivo: db.js
    * Descripcion: Base de datos con PostgreSQL
    * Author: Daniel Meza
 */
const { Pool } = require('pg');
require('dotenv').config();

// El 'Pool' leerá automáticamente las variables de entorno
// (DB_HOST, DB_USER, DB_PASSWORD, etc.) del .env
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false //La base de datos en la nube (Render) 
    // requiere una conexión segura (SSL) para proteger los datos
  }
});

// se exporta un método 'query' para usar los endpoints
module.exports = {
  query: (text, params) => pool.query(text, params),
};