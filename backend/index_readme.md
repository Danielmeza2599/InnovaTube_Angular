# InnovaTube

Servidor backend para una aplicación de gestión de videos de YouTube con sistema de autenticación y favoritos.

## Descripción

InnovaTube es una API REST desarrollada con Node.js y Express que permite a los usuarios registrarse, iniciar sesión, buscar videos de YouTube y gestionar sus videos favoritos. Utiliza PostgreSQL como base de datos para almacenar información de usuarios y favoritos, con autenticación mediante JWT.

## Características

- 🔐 Sistema de autenticación con JWT
- 👤 Registro y login de usuarios con encriptación de contraseñas (bcrypt)
- 🔍 Búsqueda de videos mediante la API de YouTube
- ⭐ Gestión de videos favoritos por usuario
- 🔒 Middleware de autenticación para rutas protegidas
- 🗃️ Base de datos PostgreSQL
- 🔎 Búsqueda y filtrado de favoritos

## Tecnologías Utilizadas

- **Node.js** - Entorno de ejecución
- **Express** - Framework web
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación mediante tokens
- **bcrypt** - Encriptación de contraseñas
- **Axios** - Cliente HTTP para consumir API de YouTube
- **CORS** - Manejo de recursos de origen cruzado
- **dotenv** - Gestión de variables de entorno

## Requisitos Previos

- Node.js v14 o superior
- PostgreSQL v12 o superior
- npm v6 o superior
- Cuenta de Google Cloud con API de YouTube habilitada (https://developers.google.com/youtube/v3?hl=es-419)

## Instalación

Clonar el repositorio:
```bash
git clone https://github.com/Danielmeza2599/InnovaTube_Angular
```

El servidor estará corriendo en `http://localhost:3000`

## Endpoints de la API

### Autenticación

#### Registro de Usuario
```http
POST /api/register
Content-Type: application/json

{
  "nombreApellido": "Juan Pérez",
  "username": "juanperez",
  "email": "juan@ejemplo.com",
  "password": "miPassword123"
}
```

#### Login
```http
POST /api/login
Content-Type: application/json

{
  "usernameOrEmail": "juanperez",
  "password": "miPassword123"
}
```

Respuesta:
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "juanperez",
  "nombreApellido": "Juan Pérez"
}
```

### Videos (Requieren Autenticación)

#### Buscar Videos
```http
GET /api/search?q=termino_busqueda
Authorization: Bearer <token>
```

#### Obtener Favoritos
```http
GET /api/favorites?q=termino_busqueda
Authorization: Bearer <token>
```

#### Agregar a Favoritos
```http
POST /api/favorites
Authorization: Bearer <token>
Content-Type: application/json

{
  "id": "video_id_youtube",
  "title": "Título del Video",
  "thumbnailUrl": "https://...",
  "channelTitle": "Nombre del Canal"
}
```

#### Eliminar de Favoritos
```http
DELETE /api/favorites/:videoId
Authorization: Bearer <token>
```

## Estructura del Proyecto

```
innovatube/
├── index.js              # Archivo principal del servidor
├── db.js                 # Configuración de conexión a PostgreSQL
├── authMiddleware.js     # Middleware de autenticación JWT
├── .env                  # Variables de entorno (no se incluye en el repo)
├── package.json          # Dependencias del proyecto
└── index_readme.md       # Documentación
```

## Seguridad

- Las contraseñas se encriptan con bcrypt antes de almacenarse
- Autenticación mediante tokens JWT con expiración de 1 hora
- Validación de duplicados en usuarios y favoritos mediante constraints UNIQUE
- Variables sensibles almacenadas en archivo .env

## Autor

**Daniel Meza**
