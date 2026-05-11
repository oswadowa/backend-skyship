const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para permitir JSON
app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
    res.json({
        nombre: "SkyShip Express API",
        version: "1.0.0",
        estado: "funcionando",
        mensaje: "Backend desplegado en AWS Elastic Beanstalk",
        endpoints: {
            health: "/api/health",
            ejemplo: "/api/ejemplo"
        }
    });
});

// Ruta de salud (health check)
app.get('/api/health', (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Ruta de ejemplo (para probar POST)
app.post('/api/ejemplo', (req, res) => {
    res.json({
        mensaje: "POST recibido correctamente",
        datosRecibidos: req.body
    });
});

// Manejar rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        error: "Ruta no encontrada",
        disponibles: ["/", "/api/health", "/api/ejemplo"]
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor SkyShip Express corriendo en puerto ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});