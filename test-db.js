const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'skyship_express'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error de conexión:', err.message);
  } else {
    console.log('✅ Conectado a MySQL');
    connection.query('SELECT * FROM Usuario', (err, rows) => {
      if (err) console.error('Error en consulta:', err);
      else console.log('Usuarios:', rows);
      connection.end();
    });
  }
});