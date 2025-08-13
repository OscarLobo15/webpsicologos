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
  // No usamos cliente_id ya que esa columna no existe en la tabla reservas

  try {
    // Intentar marcar el bloque como no disponible solo si sigue disponible
    const { data: updateData, error: updateError } = await supabase
      .from('horarios_disponibles')
      .update({ 
        disponible: false
        // Ya no usamos bloqueado porque esa columna no existe
      })
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
    // Solo filtramos por psicologo_id ya que la columna cliente_id no existe
    let data, error;
    
    if (tipoUsuario === 'psicologo') {
      const result = await supabase
        .from('reservas')
        .select('*')
        .eq('psicologo_id', userId);
      
      data = result.data;
      error = result.error;
    } else {
      // Para clientes, obtener reservas por su email
      const result = await supabase
        .from('reservas')
        .select('*')
        .eq('email_paciente', req.usuario.email);
        
      data = result.data;
      error = result.error;
    }

    if (error) return res.status(500).json({ success: false, error: "Error al obtener reservas" });

    res.json({ success: true, reservas: data });
  } catch (err) {
    next(err);
  }
};

exports.obtenerReservaPorId = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.usuario.id;
  
  try {
    // Obtener la reserva
    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .eq('horario_id', id)
      .single();

    if (error) {
      // Si no se encuentra la reserva, verificar si existe el horario y pertenece al psicólogo
      const { data: horario, error: horarioError } = await supabase
        .from('horarios_disponibles')
        .select('*, psicologo_id')
        .eq('id', id)
        .single();
        
      if (horarioError) {
        return res.status(404).json({ success: false, message: "Horario no encontrado" });
      }
      
      // Verificar que el usuario sea el psicólogo del horario
      if (horario.psicologo_id !== userId) {
        return res.status(403).json({ success: false, message: "No tienes permiso para acceder a este horario" });
      }
      
      // Si el bloque está bloqueado manualmente (no disponible, sin reserva y con flag de bloqueado)
      if (horario.bloqueado === true) {
        console.log("Detectado bloque bloqueado:", horario);
        // Devolver un tipo de respuesta específica para bloques bloqueados
        return res.json({ 
          success: true, 
          esBloqueado: true,
          horario: {
            id: horario.id,
            fecha: horario.fecha,
            hora: horario.hora
          },
          message: "Este bloque está bloqueado. ¿Deseas desbloquearlo?"
        });
      }
      
      // Devolver información del horario sin datos de reserva
      return res.json({ 
        success: true, 
        reserva: {
          horario_id: horario.id,
          psicologo_id: horario.psicologo_id,
          fecha: horario.fecha,
          hora: horario.hora,
          disponible: horario.disponible,
          bloqueado: horario.bloqueado || false,
          // Campos vacíos para la estructura del frontend
          nombre_paciente: null,
          email_paciente: null,
          telefono: null,
          edad: null,
          rut: null,
          motivo: null,
          modalidad: null,
          noReserva: true // Flag para indicar que no hay una reserva asociada
        }
      });
    }
    
    // Verificar que el usuario sea el psicólogo asociado a esta reserva
    if (data.psicologo_id !== userId) {
      return res.status(403).json({ success: false, message: "No tienes permiso para acceder a esta reserva" });
    }
    
    res.json({ success: true, reserva: data });
  } catch (err) {
    console.error("Error al obtener reserva por ID:", err);
    next(err);
  }
};

exports.cancelarReserva = async (req, res, next) => {
  const { id } = req.params;
  const { tipo } = req.body; // 'liberar' o 'bloquear'
  const userId = req.usuario.id;
  
  try {
    // Verificar que la reserva exista y pertenezca al psicólogo
    const { data: reserva, error: errorBusqueda } = await supabase
      .from('reservas')
      .select('*')
      .eq('horario_id', id)
      .single();
      
    if (errorBusqueda) {
      console.log("No se encontró reserva para el horario_id:", id);
      
      // Si no hay reserva, verificar que el horario pertenezca al psicólogo
      const { data: horario, error: errorHorario } = await supabase
        .from('horarios_disponibles')
        .select('*, psicologo_id')
        .eq('id', id)
        .single();
        
      if (errorHorario || !horario) {
        return res.status(404).json({ success: false, message: "Horario no encontrado" });
      }
      
      console.log("Horario encontrado:", horario, "Tipo de operación:", tipo);
      
      // Verificar que el usuario sea el psicólogo del horario
      if (horario.psicologo_id !== userId) {
        return res.status(403).json({ success: false, message: "No tienes permiso para modificar este horario" });
      }
      
      // La reserva no existe, pero podemos actualizar el horario directamente
      if (tipo === 'liberar') {
        console.log("Intentando liberar el bloque:", id);
        const { data: resultado, error: errorActualizar } = await supabase
          .from('horarios_disponibles')
          .update({ 
            disponible: true, 
            // Ya no usamos bloqueado porque esa columna no existe
            color: null  // Eliminamos cualquier color personalizado
          })
          .eq('id', id)
          .select();
          
        console.log("Resultado de liberar bloque:", resultado, "Error:", errorActualizar);
        
        if (errorActualizar) return res.status(500).json({ success: false, message: "Error al liberar el bloque" });
      } else if (tipo === 'bloquear') {
        const { error: errorActualizar } = await supabase
          .from('horarios_disponibles')
          .update({ 
            disponible: false,
            color: "#ff0000" // Color rojo para bloques bloqueados
          })
          .eq('id', id);
          
        if (errorActualizar) return res.status(500).json({ success: false, message: "Error al bloquear el bloque" });
      }
      
      return res.json({ success: true, message: tipo === 'liberar' ? "Bloque liberado correctamente" : "Bloque bloqueado correctamente" });
    }
    
    // La reserva existe, verificar que el usuario sea el psicólogo de la reserva
    if (reserva.psicologo_id !== userId) {
      return res.status(403).json({ success: false, message: "No tienes permiso para cancelar esta reserva" });
    }
    
    // Eliminar la reserva
    const { error: errorEliminar } = await supabase
      .from('reservas')
      .delete()
      .eq('horario_id', id);
      
    if (errorEliminar) return res.status(500).json({ success: false, message: "Error al cancelar la reserva" });
    
    // Actualizar el bloque según la elección del psicólogo
    if (tipo === 'liberar') {
      // Marcar el bloque como disponible nuevamente
      const { error: errorActualizar } = await supabase
        .from('horarios_disponibles')
        .update({ 
          disponible: true
          // Ya no usamos bloqueado porque esa columna no existe
        })
        .eq('id', id);
        
      if (errorActualizar) return res.status(500).json({ success: false, message: "Error al liberar el bloque" });
    } else if (tipo === 'bloquear') {
      // Mantener el bloque como no disponible pero con un color o marca especial
      const { error: errorActualizar } = await supabase
        .from('horarios_disponibles')
        .update({ 
          disponible: false,
          color: "#ff0000" // Color rojo para bloques bloqueados
        })
        .eq('id', id);
        
      if (errorActualizar) return res.status(500).json({ success: false, message: "Error al bloquear el bloque" });
    }
    
    res.json({ success: true, message: tipo === 'liberar' ? "Reserva cancelada y bloque liberado" : "Reserva cancelada y bloque bloqueado" });
  } catch (err) {
    next(err);
  }
};
