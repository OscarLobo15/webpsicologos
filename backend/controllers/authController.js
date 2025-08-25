const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../utils/supabaseClient');

exports.register = async (req, res, next) => {
  try {
    const {
      email, password, tipo_usuario,
      nombre, apellido,
      universidad, titulo, foto_path,
      descripcion, ciudad, comuna
    } = req.body;

    if (!email || !password || !tipo_usuario || !nombre || !apellido) {
      return res.status(400).json({ success: false, error: "Faltan campos obligatorios." });
    }

    // Verificar si el correo ya está en tu tabla personalizada
    const { data: existing } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email);

    if (existing && existing.length > 0) {
      return res.status(409).json({ success: false, error: "El correo ya está registrado." });
    }

    // Crear usuario en Supabase Auth con display_name
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: nombre + (apellido ? (" " + apellido) : "")
      }
    });
    if (authError) {
      return res.status(500).json({ success: false, error: 'Error creando usuario en Auth: ' + authError.message });
    }

    // Hashear password
    const hashedPassword = await bcrypt.hash(password, 10);


    // Insertar en usuarios
    const { data: inserted, error: insertError } = await supabase
      .from('usuarios')
      .insert([{ email, password: hashedPassword, tipo_usuario }])
      .select();
    if (insertError) {
      // Si falla aquí, intentar limpiar el usuario en Auth
      if (authUser && authUser.user && authUser.user.id) {
        await supabase.auth.admin.deleteUser(authUser.user.id);
      }
      throw insertError;
    }

    const usuario = inserted[0];

    // Crear suscripción inicial sin plan para cualquier usuario
    const fechaHoy = new Date().toISOString().slice(0, 10);
    const { error: suscripcionError } = await supabase.from('suscripciones').insert([
      {
        usuario_id: usuario.id,
        estado: 'sinplan',
        fecha_inicio: fechaHoy
      }
    ]);
    if (suscripcionError) {
      // Si falla aquí, intentar limpiar usuario y registro en usuarios
      await supabase.from('usuarios').delete().eq('id', usuario.id);
      if (authUser && authUser.user && authUser.user.id) {
        await supabase.auth.admin.deleteUser(authUser.user.id);
      }
      return res.status(500).json({ error: suscripcionError.message || 'Error al crear suscripción' });
    }

    // Crear perfil según tipo de usuario
    if (tipo_usuario === 'psicologo') {
      // Construir el objeto de perfil solo con los campos presentes
      const perfilPsicologo = {
        usuario_id: usuario.id,
        nombre,
        apellido,
        universidad,
        ciudad,
        comuna
      };
      if (typeof titulo !== 'undefined') perfilPsicologo.titulo = titulo;
      if (typeof foto_path !== 'undefined') perfilPsicologo.foto_path = foto_path;
      // Siempre enviar descripcion (string vacío si no viene)
      perfilPsicologo.descripcion = typeof descripcion !== 'undefined' ? descripcion : "";

      const { error: perfilError } = await supabase.from('perfiles_psicologos').insert([perfilPsicologo]);
      if (perfilError) {
        // Si falla aquí, intentar limpiar usuario y registro en usuarios
        await supabase.from('usuarios').delete().eq('id', usuario.id);
        if (authUser && authUser.user && authUser.user.id) {
          await supabase.auth.admin.deleteUser(authUser.user.id);
        }
        throw perfilError;
      }
    } else {
      await supabase.from('perfiles_clientes').insert([{ usuario_id: usuario.id, nombre, apellido }]);
    }

    const token = jwt.sign(
      { id: usuario.id, email, tipo_usuario },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Obtener display name desde Auth
    const displayName = authUser?.user?.user_metadata?.full_name || nombre;
    res.json({ success: true, token, user: { id: usuario.id, email, tipo_usuario, displayName } });
  } catch (err) {
    console.error('Error en registro:', err);
    if (err && err.message) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  }
};
exports.login = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, error: "Falta el email." });

    // Buscar usuario en tabla usuarios
    const { data: users } = await supabase
      .from('usuarios')
      .select('id, email, tipo_usuario')
      .eq('email', email);

    if (!users || users.length === 0)
      return res.status(401).json({ success: false, error: "Usuario no encontrado." });

    const user = users[0];

    // Buscar usuario en Auth para obtener display name
    let displayName = user.email;
    try {
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(email);
      if (authUser && authUser.user && authUser.user.user_metadata && authUser.user.user_metadata.full_name) {
        displayName = authUser.user.user_metadata.full_name;
      }
    } catch (e) {
      // Si falla, usar email
      displayName = user.email;
    }

    const token = jwt.sign(
      { id: user.id, email, tipo_usuario: user.tipo_usuario },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ success: true, token, user: { id: user.id, email, tipo_usuario: user.tipo_usuario, displayName } });
  } catch (err) {
    next(err);
  }
};
