const supabase = require('../utils/supabaseClient');

exports.getComunas = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('localizacion').select('comuna').order('comuna', { ascending: true });
    if (error) throw error;
    const comunasUnicas = [...new Set(data.map(c => c.comuna))];
    res.json(comunasUnicas);
  } catch (err) { next(err); }
};

exports.getUniversidades = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('universidades').select('nombre').order('nombre', { ascending: true });
    if (error) throw error;
    res.json(data.map(u => u.nombre));
  } catch (err) { next(err); }
};