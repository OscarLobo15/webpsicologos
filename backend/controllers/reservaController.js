const supabase = require('../utils/supabaseClient');

exports.reservarHorario = async (req, res, next) => {
  const { psicologo_id, cliente_id, horario_id, motivo } = req.body;
  try {
    const { data: horario } = await supabase.from('horarios_disponibles').select('*').eq('id', horario_id).single();
    if (!horario || !horario.disponible) return res.status(400).json({ success: false, error: 'Bloque no disponible' });

    await supabase.from('reservas').insert([{ psicologo_id, cliente_id, horario_id, fecha: horario.fecha, hora: horario.hora, motivo }]);
    await supabase.from('horarios_disponibles').update({ disponible: false }).eq('id', horario_id);
    res.json({ success: true });
  } catch (err) { next(err); }
};