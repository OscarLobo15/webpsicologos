const supabase = require('../utils/supabaseClient');

exports.getDashboardInfo = async (req, res, next) => {
  const { psicologo_id } = req.params;
  try {
    // Citas de la semana
    const { count: citasSemana } = await supabase
      .from('reservas')
      .select('*', { count: 'exact', head: true })
      .eq('psicologo_id', psicologo_id)
      .gte('fecha', new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));

    // Pacientes nuevos (últimos 30 días)
    const { count: pacientesNuevos } = await supabase
      .from('reservas')
      .select('email_paciente', { count: 'exact', head: true })
      .eq('psicologo_id', psicologo_id)
      .gte('fecha', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));

    // Sesiones del mes
    const { count: sesionesMes } = await supabase
      .from('reservas')
      .select('*', { count: 'exact', head: true })
      .eq('psicologo_id', psicologo_id)
      .gte('fecha', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));

    // Ganancia teórica (ejemplo: 20000 por sesión)
    const gananciaTeorica = (sesionesMes || 0) * 20000;
    const gananciaAjustada = gananciaTeorica * 0.9;

    // Fecha y hora actual
    const fechaActual = new Date();
    const fechaHoy = fechaActual.toISOString().slice(0, 10);
    const horaActual = fechaActual.toTimeString().slice(0, 5);
    
    // Próximas citas (solo citas futuras considerando fecha y hora)
    const { data: todasCitas } = await supabase
      .from('reservas')
      .select('*')
      .eq('psicologo_id', psicologo_id)
      .gte('fecha', fechaHoy)
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true });
      
    // Filtrar citas para excluir las que ya pasaron hoy
    const proximasCitas = (todasCitas || []).filter(cita => {
      // Si es una fecha futura, incluirla
      if (cita.fecha > fechaHoy) return true;
      // Si es hoy, verificar que la hora sea futura
      return cita.fecha === fechaHoy && cita.hora >= horaActual;
    }).slice(0, 5); // Limitar a 5 citas

    const citas = (proximasCitas || []).map(cita => ({
      nombre_paciente: cita.nombre_paciente || 'Sin nombre',
      edad: cita.edad || null,
      modalidad: cita.modalidad || 'Presencial',
      fecha: `${cita.fecha}T${cita.hora}`,
      estado: cita.estado || 'Confirmada',
      email_paciente: cita.email_paciente,
      telefono: cita.telefono,
      motivo: cita.motivo
    }));

    res.json({
      success: true,
      data: {
        citasSemana: citasSemana || 0,
        pacientesNuevos: pacientesNuevos || 0,
        sesionesMes: sesionesMes || 0,
        gananciaTeorica,
        gananciaAjustada,
        proximasCitas: citas
      }
    });
  } catch (err) {
    next(err);
  }
};
