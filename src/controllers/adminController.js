const { getConnection } = require('../config/database');

const getUsuarios = async (req, res) => {
  try {
    const pool = await getConnection();
    const [rows] = await pool.execute(`
      SELECT 
        u.IDUsuario, 
        u.NombreCompleto, 
        u.Correo, 
        u.Telefono, 
        u.Direccion, 
        t.NombreTipoUsuario as Rol, 
        u.FechaRegistro
      FROM Usuario u
      JOIN TipoUsuario t ON u.IDTipoUsuario = t.IDTipoUsuario
      ORDER BY u.FechaRegistro DESC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Error en getUsuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

const getEnvios = async (req, res) => {
  try {
    const pool = await getConnection();
    const [rows] = await pool.execute(`
      SELECT 
        p.IDPedido, 
        p.CodigoGuia, 
        p.Origen, 
        p.Destino, 
        p.Monto, 
        p.TipoPedido, 
        p.Descripcion, 
        p.Estado, 
        p.FechaCreacion,
        u.NombreCompleto as Usuario
      FROM Pedido p
      JOIN Usuario u ON p.IDUsuario = u.IDUsuario
      ORDER BY p.FechaCreacion DESC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Error en getEnvios:', error);
    res.status(500).json({ error: 'Error al obtener envíos' });
  }
};

// Filtrar usuarios
const getUsuariosFiltrados = async (req, res) => {
  try {
    const { search } = req.query;
    const pool = await getConnection();
    
    let query = `
      SELECT 
        u.IDUsuario, 
        u.NombreCompleto, 
        u.Correo, 
        u.Telefono, 
        u.Direccion, 
        t.NombreTipoUsuario as Rol, 
        u.FechaRegistro
      FROM Usuario u
      JOIN TipoUsuario t ON u.IDTipoUsuario = t.IDTipoUsuario
    `;
    
    let params = [];
    
    if (search) {
      query += ` WHERE u.NombreCompleto LIKE ? OR u.Correo LIKE ? OR u.Telefono LIKE ?`;
      const searchTerm = `%${search}%`;
      params = [searchTerm, searchTerm, searchTerm];
    }
    
    query += ` ORDER BY u.FechaRegistro DESC`;
    
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error en getUsuariosFiltrados:', error);
    res.status(500).json({ error: 'Error al filtrar usuarios' });
  }
};

// Filtrar envíos
const getEnviosFiltrados = async (req, res) => {
  try {
    const { search, fechaInicio, fechaFin } = req.query;
    const pool = await getConnection();
    
    let query = `
      SELECT 
        p.IDPedido, 
        p.CodigoGuia, 
        p.Origen, 
        p.Destino, 
        p.Monto, 
        p.TipoPedido, 
        p.Descripcion, 
        p.Estado, 
        p.FechaCreacion,
        u.NombreCompleto as Usuario
      FROM Pedido p
      JOIN Usuario u ON p.IDUsuario = u.IDUsuario
      WHERE 1=1
    `;
    
    let params = [];
    
    if (search) {
      query += ` AND (p.CodigoGuia LIKE ? OR p.Origen LIKE ? OR p.Destino LIKE ? OR u.NombreCompleto LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (fechaInicio) {
      query += ` AND DATE(p.FechaCreacion) >= ?`;
      params.push(fechaInicio);
    }
    
    if (fechaFin) {
      query += ` AND DATE(p.FechaCreacion) <= ?`;
      params.push(fechaFin);
    }
    
    query += ` ORDER BY p.FechaCreacion DESC`;
    
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error en getEnviosFiltrados:', error);
    res.status(500).json({ error: 'Error al filtrar envíos' });
  }
};

const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { NombreCompleto, Correo, Telefono, Direccion, Rol } = req.body;
    const pool = await getConnection();

    let idTipoUsuario = 2;
    if (Rol === 'Administrador') idTipoUsuario = 1;

    await pool.execute(
      `UPDATE Usuario 
       SET NombreCompleto = ?, Correo = ?, Telefono = ?, Direccion = ?, IDTipoUsuario = ?
       WHERE IDUsuario = ?`,
      [NombreCompleto, Correo, Telefono, Direccion, idTipoUsuario, id]
    );

    res.json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error('Error en updateUsuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();

    await pool.execute('DELETE FROM Usuario WHERE IDUsuario = ?', [id]);
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error en deleteUsuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

const updateEnvio = async (req, res) => {
  try {
    const { id } = req.params;
    const { CodigoGuia, Origen, Destino, Monto, Estado } = req.body;
    const pool = await getConnection();

    await pool.execute(
      `UPDATE Pedido 
       SET CodigoGuia = ?, Origen = ?, Destino = ?, Monto = ?, Estado = ?
       WHERE IDPedido = ?`,
      [CodigoGuia, Origen, Destino, Monto, Estado, id]
    );

    res.json({ message: 'Envío actualizado exitosamente' });
  } catch (error) {
    console.error('Error en updateEnvio:', error);
    res.status(500).json({ error: 'Error al actualizar envío' });
  }
};

const deleteEnvio = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();

    await pool.execute('DELETE FROM Pedido WHERE IDPedido = ?', [id]);
    res.json({ message: 'Envío eliminado exitosamente' });
  } catch (error) {
    console.error('Error en deleteEnvio:', error);
    res.status(500).json({ error: 'Error al eliminar envío' });
  }
};

const getStats = async (req, res) => {
  try {
    const { fechaInicio } = req.query;
    const pool = await getConnection();

    console.log('📊 getStats llamado con fechaInicio:', fechaInicio);

    // Total de envíos (todos o con filtro de fecha)
    let queryEnvios = 'SELECT COUNT(*) as total FROM Pedido';
    let queryIngresos = 'SELECT SUM(Monto) as total FROM Pedido WHERE Estado != "Cancelado"';
    let queryUsuarios = 'SELECT COUNT(DISTINCT IDUsuario) as total FROM Pedido WHERE Estado != "Cancelado"';
    let paramsEnvios = [];
    let paramsIngresos = [];
    let paramsUsuarios = [];

    if (fechaInicio) {
      queryEnvios += ' WHERE FechaCreacion >= ?';
      queryIngresos += ' AND FechaCreacion >= ?';
      queryUsuarios += ' AND FechaCreacion >= ?';
      paramsEnvios = [fechaInicio];
      paramsIngresos = [fechaInicio];
      paramsUsuarios = [fechaInicio];
    }

    const [totalEnvios] = await pool.execute(queryEnvios, paramsEnvios);
    const [ingresos] = await pool.execute(queryIngresos, paramsIngresos);
    const [usuariosActivos] = await pool.execute(queryUsuarios, paramsUsuarios);

    console.log('Resultados:', {
      totalEnvios: totalEnvios[0]?.total || 0,
      ingresos: ingresos[0]?.total || 0,
      usuariosActivos: usuariosActivos[0]?.total || 0
    });

    res.json({
      totalEnvios: totalEnvios[0]?.total || 0,
      ingresos: ingresos[0]?.total || 0,
      usuariosActivos: usuariosActivos[0]?.total || 0
    });
  } catch (error) {
    console.error('Error en getStats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

module.exports = {
  getUsuarios,
  getEnvios,
  getUsuariosFiltrados,
  getEnviosFiltrados,
  updateUsuario,
  deleteUsuario,
  updateEnvio,
  deleteEnvio,
  getStats
};