const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ================== REGISTRO DE USUARIO ==================
app.post('/api/register', async (req, res) => {
  try {
    const {
      email,
      password,
      tipo_usuario, // 'psicologo' o 'cliente'
      nombre,
      apellido,
      universidad,
      titulo,
      foto_url,
      descripcion,
      ciudad,
      comuna
    } = req.body;

    // Validación general
    if (!email || !password || !tipo_usuario || !nombre || !apellido) {
      return res.status(400).json({ success: false, error: "Faltan campos obligatorios." });
    }
    // Validación de campos de psicólogo
    if (tipo_usuario === 'psicologo') {
      if (!universidad || !titulo || !foto_url || !descripcion || !ciudad || !comuna) {
        return res.status(400).json({ success: false, error: "Faltan datos obligatorios de psicólogo." });
      }
    }

    // Revisa si ya existe el email
    const { data: existing } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email);

    if (existing && existing.length > 0) {
      return res.status(409).json({ success: false, error: "El correo ya está registrado." });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserta en usuarios
    const { data: inserted, error } = await supabase
      .from('usuarios')
      .insert([{
        email,
        password: hashedPassword,
        tipo_usuario,
      }])
      .select();

    if (error) throw error;

    const usuario = inserted[0];

    // Inserta en perfiles_psicologos o perfiles_clientes
    if (tipo_usuario === 'psicologo') {
      const { error: errorPerfil } = await supabase
        .from('perfiles_psicologos')
        .insert([{
          usuario_id: usuario.id,
          nombre,
          apellido,
          universidad,
          titulo,
          foto_url,
          descripcion,
          ciudad,
          comuna
        }]);
      if (errorPerfil) throw errorPerfil;
    } else if (tipo_usuario === 'cliente') {
      const { error: errorCliente } = await supabase
        .from('perfiles_clientes')
        .insert([{
          usuario_id: usuario.id,
          nombre,
          apellido
        }]);
      if (errorCliente) throw errorCliente;
    }

    // Genera el JWT (igual que en login)
    const payload = {
      id: usuario.id,
      email: usuario.email,
      tipo_usuario: usuario.tipo_usuario
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Responde con usuario básico + token
    res.json({ success: true, token, user: payload });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================== INICIO DE SESIÓN ==================
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Faltan datos." });
    }

    // Busca el usuario por email
    const { data: users, error } = await supabase
      .from('usuarios')
      .select('id, email, password, tipo_usuario')
      .eq('email', email);

    if (error) throw error;
    if (!users || users.length === 0) {
      return res.status(401).json({ success: false, error: "Correo o contraseña incorrectos." });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: "Correo o contraseña incorrectos." });
    }

    // Crea el JWT
    const payload = {
      id: user.id,
      email: user.email,
      tipo_usuario: user.tipo_usuario
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ success: true, token, user: payload });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================== OBTENER PERFIL (TOKEN) ==================
app.get('/api/profile', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No autorizado" });

  const token = auth.replace("Bearer ", "");
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return res.status(401).json({ error: "Token inválido" });
  }

  const { id, tipo_usuario } = payload;

  let perfil = {};
  if (tipo_usuario === "psicologo") {
    const { data, error } = await supabase
      .from('perfiles_psicologos')
      .select('*')
      .eq('usuario_id', id)
      .single();
    if (error) return res.status(500).json({ error: error.message });
    perfil = data;
  } else {
    const { data, error } = await supabase
      .from('perfiles_clientes')
      .select('*')
      .eq('usuario_id', id)
      .single();
    if (error) return res.status(500).json({ error: error.message });
    perfil = data;
  }

  res.json({ success: true, perfil });
});

// ================== ACTUALIZAR PERFIL ==================
app.put('/api/profile', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No autorizado" });

  const token = auth.replace("Bearer ", "");
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return res.status(401).json({ error: "Token inválido" });
  }

  const { id, tipo_usuario } = payload;
  const data = req.body;

  if (tipo_usuario === "psicologo") {
    const { error } = await supabase
      .from('perfiles_psicologos')
      .update({
        nombre: data.nombre,
        apellido: data.apellido,
        universidad: data.universidad,
        titulo: data.titulo,
        foto_url: data.foto_url,
        descripcion: data.descripcion,
        ciudad: data.ciudad,
        comuna: data.comuna,
      })
      .eq('usuario_id', id);

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  } else {
    const { error } = await supabase
      .from('perfiles_clientes')
      .update({
        nombre: data.nombre,
        apellido: data.apellido,
      })
      .eq('usuario_id', id);

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }
});

// ================== BUSCADOR Y DETALLES DE PSICÓLOGOS ==================

// Mostrar sólo psicólogos con suscripción activa
app.get('/api/psychologists', async (req, res) => {
  // Busca usuarios tipo psicólogo
  const { data: usuarios, error: usuariosError } = await supabase
    .from('usuarios')
    .select('id')
    .eq('tipo_usuario', 'psicologo');
  if (usuariosError) return res.status(500).json({ error: usuariosError.message });

  const psicologoIds = usuarios.map(u => u.id);

  // Busca suscripciones activas
  const { data: subs, error: subsError } = await supabase
    .from('suscripciones')
    .select('usuario_id')
    .eq('estado', 'activa');
  if (subsError) return res.status(500).json({ error: subsError.message });

  const activosIds = subs.map(s => s.usuario_id).filter(id => psicologoIds.includes(id));
  if (activosIds.length === 0) return res.json({ success: true, psicologos: [] });

  // Busca perfiles de esos psicólogos activos
  const { data: perfiles, error: perfilesError } = await supabase
    .from('perfiles_psicologos')
    .select('*')
    .in('usuario_id', activosIds);
  if (perfilesError) return res.status(500).json({ error: perfilesError.message });

  res.json({ success: true, psicologos: perfiles });
});

// Detalle de psicólogo por usuario_id
app.get('/api/psychologists/:id', async (req, res) => {
  const id = req.params.id;
  const { data, error } = await supabase
    .from('perfiles_psicologos')
    .select('*')
    .eq('usuario_id', id)
    .single();
  if (error || !data) return res.status(404).json({ success: false, error: "No encontrado" });
  res.json({ success: true, psicologo: data });
});

// ================== INICIA EL SERVIDOR ==================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Servidor corriendo en puerto', PORT);
});
