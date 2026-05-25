const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getConnection } = require('../config/database');

const login = async (req, res) => {
  try {
    const { correo, contrasenna } = req.body;
    
    console.log('========== LOGIN DEBUG ==========');
    console.log('📧 Correo recibido:', correo);
    console.log('🔑 Contraseña recibida:', contrasenna);
    
    const pool = await getConnection();

    const [rows] = await pool.execute(
      `SELECT u.*, t.NombreTipoUsuario 
       FROM Usuario u
       JOIN TipoUsuario t ON u.IDTipoUsuario = t.IDTipoUsuario
       WHERE u.Correo = ?`,
      [correo]
    );

    console.log('📊 Usuario encontrado:', rows.length > 0 ? 'SÍ' : 'NO');
    
    if (rows.length === 0) {
      console.log('❌ Usuario no existe en BD');
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const usuario = rows[0];
    console.log('👤 Usuario encontrado:', usuario.NombreCompleto);
    console.log('🔐 Hash guardado en BD:', usuario.Contrasenna);
    console.log('📏 Longitud del hash:', usuario.Contrasenna?.length);
    
    // Comparar contraseña
    const validPassword = await bcrypt.compare(contrasenna, usuario.Contrasenna);
    console.log('✅ ¿Contraseña válida?', validPassword);

    if (!validPassword) {
      console.log('❌ Contraseña incorrecta');
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const token = jwt.sign(
      { id: usuario.IDUsuario, correo: usuario.Correo, rol: usuario.NombreTipoUsuario },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    console.log('✅ Login exitoso, token generado');
    console.log('================================');
    
    res.json({
      token,
      usuario: {
        id: usuario.IDUsuario,
        nombre: usuario.NombreCompleto,
        correo: usuario.Correo,
        rol: usuario.NombreTipoUsuario
      }
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor: ' + error.message });
  }
};

const registro = async (req, res) => {
  try {
    const { nombre, correo, telefono, direccion, contrasenna } = req.body;
    
    console.log('========== REGISTRO DEBUG ==========');
    console.log('📝 Registrando:', { nombre, correo, telefono, direccion });
    
    const pool = await getConnection();

    // Verificar si ya existe
    const [existe] = await pool.execute(
      'SELECT IDUsuario FROM Usuario WHERE Correo = ?',
      [correo]
    );

    if (existe.length > 0) {
      console.log('❌ El correo ya existe');
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contrasenna, 10);
    console.log('🔐 Contraseña hasheada:', hashedPassword);

    // Insertar usuario
    const [result] = await pool.execute(
      `INSERT INTO Usuario (NombreCompleto, Correo, Telefono, Direccion, Contrasenna, IDTipoUsuario, FechaRegistro)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [nombre, correo, telefono, direccion, hashedPassword, 2]
    );

    console.log('✅ Usuario registrado con ID:', result.insertId);
    console.log('===================================');
    
    res.status(201).json({ 
      message: 'Usuario registrado exitosamente',
      usuarioId: result.insertId 
    });
  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({ error: 'Error en el servidor: ' + error.message });
  }
};

module.exports = { registro, login };