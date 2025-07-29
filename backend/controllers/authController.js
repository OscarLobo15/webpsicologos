const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../utils/supabaseClient');

exports.register = async (req, res, next) => {
  try {
    const {
      email, password, tipo_usuario,
      nombre, apellido,
      universidad, titulo, foto_url,
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

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      if (authError.message.includes("User already registered")) {
        return res.status(409).json({ success: false, error: "El correo ya está registrado en Auth." });
      }
      return res.status(500).json({ success: false, error: "Error al crear usuario en Auth." });
    }

    const supabase_user_id = authData.user.id;

    // Guardar en tabla usuarios (opcionalmente con hash si quieres usarlo luego)
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: inserted, error: insertError } = await supabase
      .from('usuarios')
      .insert([{ email, password: hashedPassword, tipo_usuario }])
      .select();

    if (insertError) throw insertError;

    const usuario = inserted[0];

    // Crear perfil según tipo de usuario
    if (tipo_usuario === 'psicologo') {
      await supabase.from('perfiles_psicologos').insert([{
        usuario_id: usuario.id,
        nombre, apellido, universidad, titulo,
        foto_url, descripcion, ciudad, comuna
      }]);
    } else {
      await supabase.from('perfiles_clientes').insert([{ usuario_id: usuario.id, nombre, apellido }]);
    }

    const token = jwt.sign(
      { id: usuario.id, email, tipo_usuario },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ success: true, token, user: { id: usuario.id, email, tipo_usuario } });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, error: "Faltan datos." });

    const { data: users } = await supabase
      .from('usuarios')
      .select('id, email, password, tipo_usuario')
      .eq('email', email);

    if (!users || users.length === 0)
      return res.status(401).json({ success: false, error: "Credenciales inválidas." });

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res.status(401).json({ success: false, error: "Credenciales inválidas." });

    const token = jwt.sign(
      { id: user.id, email, tipo_usuario: user.tipo_usuario },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ success: true, token, user: { id: user.id, email, tipo_usuario: user.tipo_usuario } });
  } catch (err) {
    next(err);
  }
};
