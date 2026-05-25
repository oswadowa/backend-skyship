const { getConnection } = require('../config/database');

const getMisEnvios = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const pool = await getConnection();

    const [rows] = await pool.execute(
      `SELECT IDPedido, CodigoGuia, Origen, Destino, Monto, TipoPedido, Descripcion, Estado, FechaCreacion
       FROM Pedido
       WHERE IDUsuario = ?
       ORDER BY FechaCreacion DESC`,
      [usuarioId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error en getMisEnvios:', error);
    res.status(500).json({ error: 'Error al obtener envíos' });
  }
};

const crearEnvio = async (req, res) => {
  try {
    const { codigoGuia, origen, destino, monto, tipoPedido, descripcion } = req.body;
    const usuarioId = req.usuario.id;
    const pool = await getConnection();

    const [result] = await pool.execute(
      `INSERT INTO Pedido (CodigoGuia, Origen, Destino, Monto, TipoPedido, Descripcion, Estado, IDUsuario, FechaCreacion)
       VALUES (?, ?, ?, ?, ?, ?, 'Pendiente', ?, NOW())`,
      [codigoGuia, origen, destino, monto, tipoPedido || 'Estandar', descripcion || '', usuarioId]
    );

    res.status(201).json({ 
      message: 'Envío creado exitosamente',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error en crearEnvio:', error);
    res.status(500).json({ error: 'Error al crear envío: ' + error.message });
  }
};

const cancelarEnvio = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;
    const pool = await getConnection();

    const [result] = await pool.execute(
      `UPDATE Pedido 
       SET Estado = 'Cancelado' 
       WHERE IDPedido = ? AND IDUsuario = ? AND Estado IN ('Pendiente', 'Recolectado')`,
      [id, usuarioId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: 'No se puede cancelar este envío' });
    }

    res.json({ message: 'Envío cancelado exitosamente' });
  } catch (error) {
    console.error('Error en cancelarEnvio:', error);
    res.status(500).json({ error: 'Error al cancelar envío' });
  }
};

module.exports = { getMisEnvios, crearEnvio, cancelarEnvio };