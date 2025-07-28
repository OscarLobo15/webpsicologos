const supabase = require('../utils/supabaseClient');

exports.getProfile = async (req, res, next) => {
  const { id, tipo_usuario } = req.user;
  const table = tipo_usuario === 'psicologo' ? 'perfiles_psicologos' : 'perfiles_clientes';
  try {
    const { data, error } = await supabase.from(table).select('*').eq('usuario_id', id).single();
    if (error) throw error;
    res.json({ success: true, perfil: data });
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  const { id, tipo_usuario } = req.user;
  const data = req.body;
  const table = tipo_usuario === 'psicologo' ? 'perfiles_psicologos' : 'perfiles_clientes';
  try {
    const { error } = await supabase.from(table).update(data).eq('usuario_id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) { next(err); }
};