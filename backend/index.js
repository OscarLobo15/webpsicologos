const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

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
      descripcion
    } = req.body;

    // Validación general
    if (!email || !password || !tipo_usuario || !nombre || !apellido) {
      return res.status(400).json({ success: false, error: "Faltan campos obligatorios." });
    }

    // Validación de campos de psicólogo
    if (tipo_usuario === 'psicologo') {
      if (!universidad || !titulo || !foto_url || !descripcion) {
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
      .select(); // Para obtener el id generado

    if (error) throw error;

    const usuario = inserted[0];

    // Inserta en perfiles_psicologos o perfiles_clientes según corresponda
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
          descripcion
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

    // Puedes añadir lógica para suscripciones aquí si lo deseas

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Servidor corriendo en puerto', PORT);
});


//INICIO DE SESIÓN
const jwt = require('jsonwebtoken'); // arriba del archivo

// Ruta de inicio de sesión
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


//PERFIL
app.get('/api/profile', async (req, res) => {
  // Debes validar el token JWT aquí y extraer el user.id y tipo_usuario
  // (esto lo puedes hacer con un middleware, aquí va simple por demo)

  // Recibe el token en el header Authorization
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
    // Busca en perfiles_psicologos
    const { data, error } = await supabase
      .from('perfiles_psicologos')
      .select('*')
      .eq('usuario_id', id)
      .single();
    if (error) return res.status(500).json({ error: error.message });
    perfil = data;
  } else {
    // Busca en perfiles_clientes
    const { data, error } = await supabase
      .from('perfiles_clientes')
      .select('*')
      .eq('usuario_id', id)
      .single();
    if (error) return res.status(500).json({ error: error.message });
    perfil = data;
  }

  // Devuelve el perfil completo
  res.json({ success: true, perfil });
});


//ACTUALIZAR PERFIL
app.put('/api/profile', async (req, res) => {
  // Extrae token y valida usuario
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
    // Actualiza perfil psicólogo
    const { error } = await supabase
      .from('perfiles_psicologos')
      .update({
        nombre: data.nombre,
        apellido: data.apellido,
        universidad: data.universidad,
        titulo: data.titulo,
        foto_url: data.foto_url,
        descripcion: data.descripcion,
        // agrega aquí los campos permitidos
      })
      .eq('usuario_id', id);

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  } else {
    // Actualiza perfil cliente
    const { error } = await supabase
      .from('perfiles_clientes')
      .update({
        nombre: data.nombre,
        apellido: data.apellido,
        // agrega aquí los campos permitidos
      })
      .eq('usuario_id', id);

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }
});


//DISPLAY INFO EN EL SEARCH
app.get('/api/psychologists', async (req, res) => {
  // Selecciona solo psicólogos con suscripción activa
  // 1. Busca usuarios tipo psicólogo
  const { data: usuarios, error: usuariosError } = await supabase
    .from('usuarios')
    .select('id')
    .eq('tipo_usuario', 'psicologo');
  if (usuariosError) return res.status(500).json({ error: usuariosError.message });

  const psicologoIds = usuarios.map(u => u.id);

  // 2. Busca suscripciones activas
  const { data: subs, error: subsError } = await supabase
    .from('suscripciones')
    .select('usuario_id')
    .eq('estado', 'activa');
  if (subsError) return res.status(500).json({ error: subsError.message });

  const activosIds = subs.map(s => s.usuario_id).filter(id => psicologoIds.includes(id));
  if (activosIds.length === 0) return res.json({ success: true, psicologos: [] });

  // 3. Busca perfiles de esos psicólogos activos
  const { data: perfiles, error: perfilesError } = await supabase
    .from('perfiles_psicologos')
    .select('*')
    .in('usuario_id', activosIds);
  if (perfilesError) return res.status(500).json({ error: perfilesError.message });

  res.json({ success: true, psicologos: perfiles });
});


// Busca perfil real del psicólogo por usuario_id
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
