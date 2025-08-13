// Endpoint público: obtener solo bloques disponibles para un psicólogo
exports.getDisponibilidadPublica = async (req, res, next) => {
  const { psicologo_id } = req.params;
  try {
    const { data: bloques, error } = await supabase
      .from('horarios_disponibles')
      .select('*')
      .eq('psicologo_id', psicologo_id)
      .eq('disponible', true);
    
    if (error) throw error;
    
    // Filtrar bloques para el día de hoy que tienen menos de 4 horas de anticipación
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    
    const bloquesFiltrados = bloques.filter(bloque => {
      // Si no es el día de hoy, mantener el bloque
      if (bloque.fecha !== todayStr) return true;
      
      // Si es el día de hoy, verificar que tenga al menos 4 horas de anticipación
      const [horaStr, minutosStr] = bloque.hora.split(':');
      const horaBloque = new Date();
      horaBloque.setHours(parseInt(horaStr, 10), parseInt(minutosStr, 10), 0, 0);
      
      // Calcular la diferencia en milisegundos y convertirla a horas
      const diferenciaMilis = horaBloque - today;
      const diferenciaHoras = diferenciaMilis / (1000 * 60 * 60);
      
      // Mantener el bloque solo si tiene al menos 4 horas de anticipación
      return diferenciaHoras >= 4;
    });
    
    res.json({ success: true, bloques: bloquesFiltrados });
  } catch (err) {
    next(err);
  }
};
const supabase = require('../utils/supabaseClient');

exports.getHorarios = async (req, res, next) => {
  const { psicologo_id } = req.params;
  try {
    // Traer todos los bloques de disponibilidad de este psicólogo
    const { data: bloques, error } = await supabase
      .from('horarios_disponibles')
      .select('*')
      .eq('psicologo_id', psicologo_id);
    if (error) throw error;

    // Para cada bloque, determinar su estado: disponible, reservado o bloqueado
    const bloquesConReserva = await Promise.all(
      bloques.map(async (bloque) => {
        // Primero verificamos si el bloque está disponible (verde)
        if (bloque.disponible) {
          return {
            ...bloque,
            bloqueado: false,
            esReserva: false,
            tipo: 'disponible'
          };
        }
        
        // Si el bloque no está disponible, verificamos si tiene una reserva asociada
        const { data: reserva, error: errorReserva } = await supabase
          .from('reservas')
          .select('id, modalidad, nombre_paciente, email_paciente, telefono, edad, motivo, rut')
          .eq('horario_id', bloque.id)
          .maybeSingle();
        
        if (errorReserva) {
          // Error silencioso
        }
        
        // Si tiene una reserva, es un bloque reservado (azul)
        if (reserva) {
          return {
            ...bloque,
            paciente_nombre: reserva.nombre_paciente || 'Paciente',
            email_paciente: reserva.email_paciente,
            telefono: reserva.telefono,
            edad: reserva.edad,
            modalidad: reserva.modalidad || '',
            motivo: reserva.motivo,
            rut: reserva.rut,
            bloqueado: false,
            esReserva: true,
            tipo: 'reservado'
          };
        }
        
        // Si no está disponible y no tiene reserva, es un bloque bloqueado por el psicólogo (rojo)
        return {
          ...bloque,
          bloqueado: true,
          esReserva: false,
          tipo: 'bloqueado'
        };
      })
    );
    res.json({ success: true, data: bloquesConReserva });
  } catch (err) { next(err); }
};

exports.addHorario = async (req, res, next) => {
  // El id del psicólogo debe venir del token, no del parámetro
  const userId = req.user?.id;
  const { psicologo_id } = req.params;
  const { fecha, hora, hora_fin } = req.body;

  // Validar que el usuario autenticado coincide con el parámetro
  if (parseInt(psicologo_id) !== userId) {
    return res.status(403).json({ success: false, message: "No autorizado" });
  }

  // Validar formato de fecha y hora
  if (!fecha || !hora || !hora_fin) {
    return res.status(400).json({ success: false, message: "Faltan datos obligatorios (fecha, hora, hora_fin)" });
  }
  // Validación simple de formato (YYYY-MM-DD y HH:mm)
  const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
  const horaRegex = /^\d{2}:\d{2}$/;
  if (!fechaRegex.test(fecha) || !horaRegex.test(hora) || !horaRegex.test(hora_fin)) {
    return res.status(400).json({ success: false, message: "Formato de fecha u hora inválido" });
  }
  if (hora >= hora_fin) {
    return res.status(400).json({ success: false, message: "La hora de fin debe ser posterior a la de inicio" });
  }

  try {
    // Validar que no se superponga con otro bloque del mismo psicólogo
    const { data: existentes, error: errorExist } = await supabase
      .from('horarios_disponibles')
      .select('id, fecha, hora, hora_fin')
      .eq('psicologo_id', userId)
      .eq('fecha', fecha);
    if (errorExist) throw errorExist;
    // Convertir horas a minutos para comparar correctamente
    function horaATotalMinutos(h) {
      const [hh, mm] = h.split(":").map(Number);
      return hh * 60 + mm;
    }
    const nuevoInicio = horaATotalMinutos(hora);
    const nuevoFin = horaATotalMinutos(hora_fin);
    const solapado = (existentes || []).some(b => {
      const bInicio = horaATotalMinutos(b.hora);
      const bFin = horaATotalMinutos(b.hora_fin);
      return (nuevoInicio < bFin && nuevoFin > bInicio);
    });
    if (solapado) {
      return res.status(400).json({ success: false, message: 'El bloque se superpone con otro existente.' });
    }
    const { error } = await supabase.from('horarios_disponibles').insert([
      {
        psicologo_id: userId,
        fecha,
        hora,
        hora_fin,
        disponible: true
      }
    ]);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) { next(err); }
};

exports.updateHorario = async (req, res, next) => {
  const { id } = req.params;
  const { fecha, hora, hora_fin } = req.body;
  if (!fecha || !hora || !hora_fin) {
    return res.status(400).json({ success: false, message: "Faltan datos obligatorios (fecha, hora, hora_fin)" });
  }
  const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
  const horaRegex = /^\d{2}:\d{2}$/;
  if (!fechaRegex.test(fecha) || !horaRegex.test(hora) || !horaRegex.test(hora_fin)) {
    return res.status(400).json({ success: false, message: "Formato de fecha u hora inválido" });
  }
  if (hora >= hora_fin) {
    return res.status(400).json({ success: false, message: "La hora de fin debe ser posterior a la de inicio" });
  }
  try {
    // Validar que no se superponga con otro bloque del mismo psicólogo (excepto el actual)
    const { data: actuales, error: errorExist } = await supabase
      .from('horarios_disponibles')
      .select('id, fecha, hora, hora_fin, psicologo_id')
      .eq('fecha', fecha);
    if (errorExist) throw errorExist;
    // Convertir horas a minutos para comparar correctamente
    function horaATotalMinutos(h) {
      const [hh, mm] = h.split(":").map(Number);
      return hh * 60 + mm;
    }
    const nuevoInicio = horaATotalMinutos(hora);
    const nuevoFin = horaATotalMinutos(hora_fin);
    const solapado = (actuales || []).some(b => {
      if (b.id == id || b.psicologo_id != req.user.id) return false;
      const bInicio = horaATotalMinutos(b.hora);
      const bFin = horaATotalMinutos(b.hora_fin);
      return (nuevoInicio < bFin && nuevoFin > bInicio);
    });
    if (solapado) {
      return res.status(400).json({ success: false, message: 'El bloque se superpone con otro existente.' });
    }
    const { error } = await supabase
      .from('horarios_disponibles')
      .update({ fecha, hora, hora_fin })
      .eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) { next(err); }
};

exports.deleteHorario = async (req, res, next) => {
  const { id } = req.params;
  try {
    // Buscar si existe una reserva asociada a este bloque
    const { data: reservas, error: errorReserva } = await supabase
      .from('reservas')
      .select('id')
      .eq('horario_id', id)
      .limit(1);
    if (errorReserva) throw errorReserva;
    if (reservas && reservas.length > 0) {
      return res.status(400).json({ success: false, message: 'No se puede eliminar: el bloque ya está reservado.' });
    }
    // Eliminar el bloque de la base de datos, sin importar si fue movido
    const { error } = await supabase.from('horarios_disponibles').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) { next(err); }
};