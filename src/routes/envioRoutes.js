const express = require('express');
const { getMisEnvios, crearEnvio, cancelarEnvio } = require('../controllers/envioController');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);
router.get('/mis-envios', getMisEnvios);
router.post('/', crearEnvio);
router.put('/:id/cancelar', cancelarEnvio);

module.exports = router;