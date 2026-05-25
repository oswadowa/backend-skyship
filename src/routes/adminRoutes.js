const express = require('express');
const {
  getUsuarios,
  getEnvios,
  getUsuariosFiltrados,
  getEnviosFiltrados,
  updateUsuario,
  deleteUsuario,
  updateEnvio,
  deleteEnvio,
  getStats
} = require('../controllers/adminController');
const { authMiddleware, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);
router.use(isAdmin);

// Rutas con filtros
router.get('/usuarios', getUsuariosFiltrados);
router.get('/envios', getEnviosFiltrados);

// CRUD
router.put('/usuarios/:id', updateUsuario);
router.delete('/usuarios/:id', deleteUsuario);
router.put('/envios/:id', updateEnvio);
router.delete('/envios/:id', deleteEnvio);
router.get('/stats', getStats);

module.exports = router;