const supabase = require('../utils/supabaseClient');

exports.reservarHorario = async (req, res, next) => {
  const {
    psicologo_id,
    horario_id,
    motivo,
    nombre_paciente,
    email_paciente,
    rut,
    edad,
    telefono,
    modalidad
  } = req.body;
  const cliente_id = req.usuario.id; // ← obtenido desde el token

  try {
    // Intentar marcar el bloque como no disponible solo si sigue disponible
    const { data: updateData, error: updateError } = await supabase
      .from('horarios_disponibles')
      .update({ disponible: false })
      .eq('id', horario_id)
      .eq('disponible', true)
      .select();

    if (updateError) {
      console.error('Error al actualizar disponibilidad:', updateError);
      return res.status(500).json({ success: false, error: 'No se pudo actualizar la disponibilidad' });
    }
    if (!updateData || updateData.length === 0) {
      // Nadie pudo actualizar: ya fue reservado
      return res.status(400).json({ success: false, error: 'Bloque ya fue reservado por otro usuario. Elige otro horario.' });
    }

    // Insertar la reserva solo si se pudo actualizar
    const bloque = updateData[0];
    const { error: insertError } = await supabase.from('reservas').insert([{
      psicologo_id,
      horario_id,
      fecha: bloque.fecha,
      hora: bloque.hora,
      motivo,
      nombre_paciente,
      email_paciente,
      rut,
      edad,
      telefono: telefono || null,
      modalidad: modalidad || null
    }]);
    if (insertError) {
      console.error('Error al insertar reserva:', insertError);
      return res.status(500).json({ success: false, error: 'No se pudo guardar la reserva' });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

exports.obtenerMisReservas = async (req, res, next) => {
  const userId = req.usuario.id;
  const tipoUsuario = req.usuario.tipo_usuario;

  try {
    // Filtrar según rol (psicólogo o cliente)
    const columna = tipoUsuario === 'psicologo' ? 'psicologo_id' : 'cliente_id';

    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .eq(columna, userId);

    if (error) return res.status(500).json({ success: false, error: "Error al obtener reservas" });

    res.json({ success: true, reservas: data });
  } catch (err) {
    next(err);
  }
};
