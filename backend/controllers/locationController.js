const supabase = require('../utils/supabaseClient');

exports.getComunas = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('localizacion')
      .select('ciudad, comuna')
      .order('ciudad', { ascending: true });

    if (error) throw error;
    res.json(data); // En formato correcto para el frontend
  } catch (err) {
    next(err);
  }
};

exports.getUniversidades = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('universidades').select('nombre').order('nombre', { ascending: true });
    if (error) throw error;
    res.json(data.map(u => u.nombre));
  } catch (err) { next(err); }
};