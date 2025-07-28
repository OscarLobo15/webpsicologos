const supabase = require('../utils/supabaseClient');

exports.getHorarios = async (req, res, next) => {
  const { psicologo_id } = req.params;
  try {
    const { data, error } = await supabase.from('horarios_disponibles').select('*').eq('psicologo_id', psicologo_id);
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.addHorario = async (req, res, next) => {
  const { psicologo_id } = req.params;
  const { fecha, hora, disponible } = req.body;
  try {
    await supabase.from('horarios_disponibles').insert([{ psicologo_id: parseInt(psicologo_id), fecha, hora, disponible }]);
    res.json({ success: true });
  } catch (err) { next(err); }
};

exports.deleteHorario = async (req, res, next) => {
  const { id } = req.params;
  try {
    await supabase.from('horarios_disponibles').delete().eq('id', id);
    res.json({ success: true });
  } catch (err) { next(err); }
};