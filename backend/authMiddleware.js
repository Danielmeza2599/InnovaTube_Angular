const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function authMiddleware(req, res, next) {
  // Se obtiene el token del header 'Authorization'
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    // 401 Unauthorized: No hubo token
    return res.status(401).json({ error: 'No hubo token' });
  }

  // El token viene en formato "Bearer <token>"
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token malformado' });
  }

  try {
    // Validar el token
    const decodedPayload = jwt.verify(token, JWT_SECRET);

    // Se adjunta la info del usuario al objeto 'req'
    // Las rutas protegidas sabrán quién es el usuario
    req.user = decodedPayload; // Ej: { userId: 1, username: 'meza' }

    // TODO: Continuar con la siguiente función (el endpoint)
    next();
  } catch (error) {
    // 403 Forbidden: El token es inválido (firmado mal, expirado, etc.)
    return res.status(403).json({ error: 'Token inválido' });
  }
}

module.exports = authMiddleware;