const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

// Configuración de la conexión a PostgreSQL/Supabase
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false } // Necesario para Supabase
});

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta raíz de prueba
app.get('/', (req, res) => {
  res.json({ message: 'Backend funcionando 🚀' });
});

// Ruta para probar conexión a la base de datos
app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Registro de usuario (psicólogo o cliente)
app.post('/api/register', async (req, res) => {
  const { email, password, tipo_usuario } = req.body;

  if (!email || !password || !tipo_usuario) {
    return res.status(400).json({ error: 'Faltan datos obligatorios.' });
  }

  try {
    // Verifica si el usuario ya existe
    const existe = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado.' });
    }

    // Hashea la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Inserta el nuevo usuario
    const result = await pool.query(
      `INSERT INTO usuarios (email, password, tipo_usuario) 
       VALUES ($1, $2, $3) RETURNING id, email, tipo_usuario`,
      [email, hashedPassword, tipo_usuario]
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente.',
      usuario: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login de usuario
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan datos obligatorios.' });
  }

  try {
    // Busca el usuario por email
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const usuario = result.rows[0];

    // Compara la contraseña
    const passwordOk = await bcrypt.compare(password, usuario.password);
    if (!passwordOk) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // Genera el token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      message: 'Login exitoso.',
      token: token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Middleware para verificar JWT
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  // El token debería venir como: 'Bearer eyJhbGciOiJI...'
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) return res.status(403).json({ error: 'Token inválido.' });
    req.usuario = usuario; // usuario contiene los datos que guardaste en el JWT
    next();
  });
}

// Ejemplo de ruta protegida
app.get('/api/perfil', verificarToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, tipo_usuario FROM usuarios WHERE id = $1',
      [req.usuario.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    res.json({ usuario: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear o actualizar perfil de psicólogo
app.post('/api/perfil-psicologo', verificarToken, async (req, res) => {
  // Solo psicólogos pueden crear/editar perfil
  if (req.usuario.tipo_usuario !== 'psicologo') {
    return res.status(403).json({ error: 'Solo los psicólogos pueden editar este perfil.' });
  }

  const { nombre, apellido, universidad, titulo, foto_url, descripcion } = req.body;

  if (!nombre || !apellido || !universidad || !titulo || !descripcion) {
    return res.status(400).json({ error: 'Faltan datos obligatorios.' });
  }

  try {
    // ¿Ya existe perfil?
    const existe = await pool.query(
      'SELECT * FROM perfiles_psicologos WHERE usuario_id = $1',
      [req.usuario.id]
    );

    let result;
    if (existe.rows.length > 0) {
      // Actualiza el perfil
      result = await pool.query(
        `UPDATE perfiles_psicologos
         SET nombre=$1, apellido=$2, universidad=$3, titulo=$4, foto_url=$5, descripcion=$6, actualizado_en=NOW()
         WHERE usuario_id=$7
         RETURNING *`,
        [nombre, apellido, universidad, titulo, foto_url, descripcion, req.usuario.id]
      );
    } else {
      // Crea el perfil
      result = await pool.query(
        `INSERT INTO perfiles_psicologos
         (usuario_id, nombre, apellido, universidad, titulo, foto_url, descripcion)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [req.usuario.id, nombre, apellido, universidad, titulo, foto_url, descripcion]
      );
    }

    res.json({ message: 'Perfil de psicólogo guardado correctamente.', perfil: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener perfil del psicólogo logueado
app.get('/api/perfil-psicologo', verificarToken, async (req, res) => {
  if (req.usuario.tipo_usuario !== 'psicologo') {
    return res.status(403).json({ error: 'Solo los psicólogos pueden ver este perfil.' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM perfiles_psicologos WHERE usuario_id = $1',
      [req.usuario.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Perfil no encontrado.' });
    }
    res.json({ perfil: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en puerto ${PORT}`);
});
