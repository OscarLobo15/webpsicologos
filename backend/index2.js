// backend/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const locationRoutes = require('./routes/location');

const app = express();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(cors());
app.use(express.json());
app.use("/api", locationRoutes);

// ================== REGISTRO DE USUARIO ==================
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, tipo_usuario, nombre, apellido, universidad, titulo, foto_url, descripcion, ciudad, comuna } = req.body;

    if (!email || !password || !tipo_usuario || !nombre || !apellido) {
      return res.status(400).json({ success: false, error: "Faltan campos obligatorios." });
    }
    if (tipo_usuario === 'psicologo' && (!universidad || !titulo || !foto_url || !descripcion || !ciudad || !comuna)) {
      return res.status(400).json({ success: false, error: "Faltan datos obligatorios de psicólogo." });
    }

    const { data: existing } = await supabase.from('usuarios').select('id').eq('email', email);
    if (existing && existing.length > 0) {
      return res.status(409).json({ success: false, error: "El correo ya está registrado." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: inserted, error } = await supabase
      .from('usuarios')
      .insert([{ email, password: hashedPassword, tipo_usuario }])
      .select();

    if (error) throw error;

    const usuario = inserted[0];

    if (tipo_usuario === 'psicologo') {
      const { error: errorPerfil } = await supabase
        .from('perfiles_psicologos')
        .insert([{ usuario_id: usuario.id, nombre, apellido, universidad, titulo, foto_url, descripcion, ciudad, comuna }]);
      if (errorPerfil) throw errorPerfil;
    } else if (tipo_usuario === 'cliente') {
      const { error: errorCliente } = await supabase
        .from('perfiles_clientes')
        .insert([{ usuario_id: usuario.id, nombre, apellido }]);
      if (errorCliente) throw errorCliente;
    }

    const payload = { id: usuario.id, email: usuario.email, tipo_usuario: usuario.tipo_usuario };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ success: true, token, user: payload });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================== INICIO DE SESIÓN ==================
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: "Faltan datos." });

    const { data: users, error } = await supabase.from('usuarios').select('id, email, password, tipo_usuario').eq('email', email);
    if (error || !users || users.length === 0) return res.status(401).json({ success: false, error: "Correo o contraseña incorrectos." });

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ success: false, error: "Correo o contraseña incorrectos." });

    const payload = { id: user.id, email: user.email, tipo_usuario: user.tipo_usuario };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ success: true, token, user: payload });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================== PERFIL ==================
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

  const table = tipo_usuario === 'psicologo' ? 'perfiles_psicologos' : 'perfiles_clientes';
  const { error } = await supabase.from(table).update(data).eq('usuario_id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ================== HORARIOS ==================
app.get('/api/horarios/psicologo/:psicologo_id', async (req, res) => {
  const { psicologo_id } = req.params;
  const { semana_inicio, semana_fin } = req.query;

  try {
    let query = supabase
      .from('horarios_disponibles')
      .select('*')
      .eq('psicologo_id', psicologo_id);

    if (semana_inicio && semana_fin) {
      query = query.gte('fecha', semana_inicio).lte('fecha', semana_fin);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/horarios/:psicologo_id', async (req, res) => {
  const { psicologo_id } = req.params;
  const { fecha, hora, disponible } = req.body;
  try {
    const { error } = await supabase
      .from('horarios_disponibles')
      .insert([{ psicologo_id: parseInt(psicologo_id), fecha, hora, disponible }]);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/horarios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('horarios_disponibles').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/horarios/repetir/:psicologo_id', async (req, res) => {
  const { psicologo_id } = req.params;
  try {
    const { data: semanaActual, error } = await supabase
      .from('horarios_disponibles')
      .select('*')
      .eq('psicologo_id', psicologo_id)
      .eq('disponible', true);

    if (error) throw error;

    const bloquesAInsertar = [];
    for (let i = 1; i <= 4; i++) {
      for (const bloque of semanaActual) {
        const nuevaFecha = new Date(bloque.fecha);
        nuevaFecha.setDate(nuevaFecha.getDate() + i * 7);
        bloquesAInsertar.push({
          psicologo_id: parseInt(psicologo_id),
          fecha: nuevaFecha.toISOString().split('T')[0],
          hora: bloque.hora,
          disponible: true
        });
      }
    }

    const { data: existentes } = await supabase.rpc('filtrar_bloques_existentes', {
      bloques: bloquesAInsertar
    });

    const nuevos = bloquesAInsertar.filter(b =>
      !existentes.some(e => e.fecha === b.fecha && e.hora === b.hora)
    );

    if (nuevos.length > 0) {
      const { error: insertError } = await supabase
        .from('horarios_disponibles')
        .insert(nuevos);
      if (insertError) throw insertError;
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================== RESERVAR HORARIO ==================
app.post('/api/reservar', async (req, res) => {
  const { psicologo_id, cliente_id, horario_id, motivo } = req.body;

  try {
    const { data: horario, error: horarioError } = await supabase
      .from('horarios_disponibles')
      .select('*')
      .eq('id', horario_id)
      .single();

    if (horarioError || !horario || !horario.disponible) {
      return res.status(400).json({ success: false, error: 'Bloque no disponible' });
    }

    const { error: insertError } = await supabase
      .from('reservas')
      .insert([{
        psicologo_id,
        cliente_id,
        horario_id,
        fecha: horario.fecha,
        hora: horario.hora,
        motivo
      }]);

    if (insertError) throw insertError;

    const { error: updateError } = await supabase
      .from('horarios_disponibles')
      .update({ disponible: false })
      .eq('id', horario_id);

    if (updateError) throw updateError;

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================== BUSCAR PSICÓLOGOS ==================
app.get('/api/psychologists', async (req, res) => {
  const { data: usuarios, error: usuariosError } = await supabase
    .from('usuarios')
    .select('id')
    .eq('tipo_usuario', 'psicologo');
  if (usuariosError) return res.status(500).json({ error: usuariosError.message });

  const psicologoIds = usuarios.map(u => u.id);

  const { data: subs, error: subsError } = await supabase
    .from('suscripciones')
    .select('usuario_id')
    .eq('estado', 'activa');
  if (subsError) return res.status(500).json({ error: subsError.message });

  const activosIds = subs.map(s => s.usuario_id).filter(id => psicologoIds.includes(id));
  if (activosIds.length === 0) return res.json({ success: true, psicologos: [] });

  const { data: perfiles, error: perfilesError } = await supabase
    .from('perfiles_psicologos')
    .select('*')
    .in('usuario_id', activosIds);
  if (perfilesError) return res.status(500).json({ error: perfilesError.message });

  res.json({ success: true, psicologos: perfiles });
});

app.get('/api/psychologists/:id', async (req, res) => {
  const id = req.params.id;
  const { data, error } = await supabase
    .from('perfiles_psicologos')
    .select('*')
    .eq('usuario_id', id)
    .single();
  if (error || !data) return res.status(404).json({ success: false, error: "No encontrado" });
  data.usuario_id = id; // Asegura que usuario_id esté presente explícitamente
  res.json({ success: true, psicologo: data });
});

// ================== INICIAR SERVIDOR ==================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Servidor corriendo en puerto', PORT);
});

