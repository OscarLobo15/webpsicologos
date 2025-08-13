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
      .select('cliente_id', { count: 'exact', head: true })
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

    // Próximas citas
    const { data: proximasCitas } = await supabase
      .from('reservas')
      .select('fecha, modalidad, estado, perfiles_clientes(nombre, apellido)')
      .eq('psicologo_id', psicologo_id)
      .gte('fecha', new Date().toISOString().slice(0, 10))
      .order('fecha', { ascending: true })
      .limit(5);

    const citas = (proximasCitas || []).map(cita => ({
      nombre_paciente: cita.perfiles_clientes ? `${cita.perfiles_clientes.nombre} ${cita.perfiles_clientes.apellido}` : '',
      modalidad: cita.modalidad,
      fecha: cita.fecha,
      estado: cita.estado
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
