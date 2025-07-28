const supabase = require('../utils/supabaseClient');

exports.listarPsicologos = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    const { data: activos } = await supabase.from('suscripciones').select('usuario_id').eq('estado', 'activa');
    const activosIds = activos.map(s => s.usuario_id);

    let query = supabase.from('perfiles_psicologos').select('*', { count: 'exact' });
    if (search) query = query.ilike('nombre', `%${search}%`);
    query = query.in('usuario_id', activosIds).range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ success: true, data, total: count });
  } catch (err) { next(err); }
};

exports.obtenerPsicologo = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { data, error } = await supabase.from('perfiles_psicologos').select('*').eq('usuario_id', id).single();
    if (error || !data) return res.status(404).json({ success: false, error: "No encontrado" });
    res.json({ success: true, psicologo: data });
  } catch (err) { next(err); }
};