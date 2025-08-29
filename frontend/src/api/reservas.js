// Reserva una hora enviando los datos y el token JWT
export async function reservarHorario({ psicologo_id, horario_id, nombre_paciente, email_paciente, rut, edad, motivo, telefono, modalidad }, token) {
  const res = await fetch('http://localhost:5000/api/reservas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ psicologo_id, horario_id, nombre_paciente, email_paciente, rut, edad, motivo, telefono, modalidad })
  });
  return res.json();
}
