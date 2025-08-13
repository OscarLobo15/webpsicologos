const supabase = require('../utils/supabaseClient');

// Bloquear un horario disponible (cambia disponible = false)
exports.bloquearHorario = async (req, res, next) => {
  const { id } = req.params;
  try {
    // Verificar que el bloque existe y está disponible
    const { data: bloque, error: errorBloque } = await supabase
      .from('horarios_disponibles')
      .select('*')
      .eq('id', id)
      .single();
      
    if (errorBloque) {
      return res.status(404).json({ success: false, message: 'Error al buscar el bloque', error: errorBloque });
    }
    
    if (!bloque) {
      return res.status(404).json({ success: false, message: 'Bloque no encontrado' });
    }
    
    // Verificar que no tiene reservas
    const { data: reservas, error: errorReserva } = await supabase
      .from('reservas')
      .select('id')
      .eq('horario_id', id)
      .limit(1);
      
    if (errorReserva) {
      return res.status(500).json({ success: false, message: 'Error al verificar reservas', error: errorReserva });
    }
    
    if (reservas && reservas.length > 0) {
      return res.status(400).json({ success: false, message: 'No se puede bloquear: el bloque ya está reservado.' });
    }
    
    // Actualizar el estado del bloque (solo disponible = false)
    const { error } = await supabase
      .from('horarios_disponibles')
      .update({ disponible: false })
      .eq('id', id);
      
    if (error) {
      return res.status(500).json({ success: false, message: 'Error al actualizar disponibilidad', error });
    }
    
    res.json({ success: true, message: 'Bloque bloqueado correctamente' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: err.message });
  }
};

// Desbloquear un horario bloqueado (cambia disponible = true)
exports.desbloquearHorario = async (req, res, next) => {
  const { id } = req.params;
  try {
    // Verificar que el bloque existe
    const { data: bloque, error: errorBloque } = await supabase
      .from('horarios_disponibles')
      .select('*')
      .eq('id', id)
      .single();
      
    if (errorBloque) {
      return res.status(404).json({ success: false, message: 'Error al buscar el bloque', error: errorBloque });
    }
    
    if (!bloque) {
      return res.status(404).json({ success: false, message: 'Bloque no encontrado' });
    }
    
    // Actualizar el estado del bloque (solo disponible = true)
    const { error } = await supabase
      .from('horarios_disponibles')
      .update({ disponible: true })
      .eq('id', id);
      
    if (error) {
      return res.status(500).json({ success: false, message: 'Error al actualizar disponibilidad', error });
    }
    
    res.json({ success: true, message: 'Bloque desbloqueado correctamente' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: err.message });
  }
};
