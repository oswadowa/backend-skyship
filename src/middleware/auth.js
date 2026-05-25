const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'Administrador') {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren privilegios de administrador' });
  }
  next();
};

module.exports = { authMiddleware, isAdmin };