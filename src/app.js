const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const envioRoutes = require('./routes/envioRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Configurar CORS para aceptar el frontend (IP pública y local)
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://54.221.122.67:3001',  // ← Agrega la IP de tu frontend
    'http://54.221.122.67:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Rutas
app.use('/api', authRoutes);
app.use('/api/envios', envioRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Endpoint para probar la base de datos
app.get('/api/test-db', async (req, res) => {
  try {
    const pool = require('./config/database').getConnection;
    const conn = await pool();
    const [result] = await conn.execute('SELECT NOW() as time, DATABASE() as db');
    res.json({ 
      success: true, 
      time: result[0].time,
      database: result[0].db,
      message: '✅ Conexión a BD exitosa'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.get('/api/ver-usuarios', async (req, res) => {
  try {
    const { allQuery } = require('./config/database');
    const usuarios = await allQuery('SELECT IDUsuario, NombreCompleto, Correo, Telefono, FechaRegistro FROM Usuario');
    res.json({ 
      total: usuarios.length,
      usuarios: usuarios 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;