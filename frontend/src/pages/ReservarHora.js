import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useParams, useNavigate } from "react-router-dom";
import DisponibilidadPublica from "../Components/DisponibilidadPublica";
import toast, { Toaster } from "react-hot-toast";
import { reservarHorario } from "../api/reservas";

export default function ReservarHora() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [usuarioIdPsicologo, setUsuarioIdPsicologo] = useState(null);
  const [psicologoNombre, setPsicologoNombre] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState(null);
  const [form, setForm] = useState({ nombre: "", correo: "", rut: "", edad: "", motivo: "", telefono: "", modalidad: "" });
  const [enviando, setEnviando] = useState(false);
  const [resumenReserva, setResumenReserva] = useState(null);


  const fetchUsuarioIdPsicologo = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/psychologists/${id}`);
      const json = await res.json();
      if (json.success && json.psicologo) {
        setUsuarioIdPsicologo(json.psicologo.usuario_id);
        setPsicologoNombre(json.psicologo.nombre + (json.psicologo.apellido ? (" " + json.psicologo.apellido) : ""));
      }
    } catch (err) {
      toast.error("No se pudo obtener el perfil del psicólogo");
    }
  };

  // Obtener display name del usuario autenticado (si está logueado)
  const fetchDisplayName = async () => {
    const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;
    if (user && user.user_metadata && user.user_metadata.full_name) {
      setDisplayName(user.user_metadata.full_name);
    } else if (user && user.email) {
      setDisplayName(user.email);
    }
  };

  useEffect(() => {
    fetchUsuarioIdPsicologo();
    fetchDisplayName();
  }, [id]);


  const volverAlPerfil = () => {
    if (usuarioIdPsicologo) {
      navigate(`/psychologist/${usuarioIdPsicologo}`);
    } else {
      toast.error("No se pudo determinar el perfil del psicólogo");
    }
  };

  return (
    <div className="min-vh-100 bg-light d-flex flex-column align-items-center p-4">
      <div className="w-100" style={{ maxWidth: 900 }}>
        <h2 className="fw-bold text-center mb-3 text-primary">Reservar una sesión</h2>
        {(!bloqueSeleccionado) && (
          <>
            <p className="text-muted text-center mb-3">
              Selecciona un bloque horario disponible para agendar tu sesión con el psicólogo.
            </p>
            <button className="btn btn-outline-secondary mb-3" onClick={volverAlPerfil}>
              ← Volver al perfil
            </button>
            <div className="mb-4">
              <DisponibilidadPublica psicologoId={id} onSeleccionarBloque={setBloqueSeleccionado} />
            </div>
          </>
        )}
        {(bloqueSeleccionado) && (
          <div className="rounded-3xl shadow-lg border border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100 p-4 p-md-5 mx-auto" style={{maxWidth: 600}}>
            <button className="btn btn-outline-primary mb-3" onClick={() => setBloqueSeleccionado(null)}>
              ← Ver horas disponibles
            </button>
            <h4 className="mb-4 text-blue-800 font-extrabold text-2xl text-center">Confirmar reserva</h4>
            <div className="mb-3 flex flex-wrap gap-4 justify-center">
              <div className="bg-white rounded-xl px-4 py-2 shadow border border-blue-200 text-blue-700 font-semibold">
                <b>Fecha:</b> {bloqueSeleccionado.fecha}
              </div>
              <div className="bg-white rounded-xl px-4 py-2 shadow border border-blue-200 text-blue-700 font-semibold">
                <b>Hora:</b> {bloqueSeleccionado.hora} {bloqueSeleccionado.hora_fin ? `- ${bloqueSeleccionado.hora_fin}` : ""}
              </div>
            </div>
            <form onSubmit={async e => {
                e.preventDefault();
                if (!form.nombre || !form.correo || !form.rut || !form.edad || !form.motivo || !form.telefono || !form.modalidad) {
                  toast.error("Todos los campos son obligatorios");
                  return;
                }
                setEnviando(true);
                try {
                  const token = localStorage.getItem("token");
                  const data = await reservarHorario({
                    psicologo_id: id,
                    horario_id: bloqueSeleccionado.id,
                    nombre_paciente: form.nombre,
                    email_paciente: form.correo,
                    rut: form.rut,
                    edad: form.edad,
                    motivo: form.motivo,
                    telefono: form.telefono,
                    modalidad: form.modalidad
                  }, token);
                  if (data.success) {
                    toast.success("Hora reservada con éxito");
                    setResumenReserva({
                      ...form,
                      fecha: bloqueSeleccionado.fecha,
                      hora: bloqueSeleccionado.hora,
                      hora_fin: bloqueSeleccionado.hora_fin
                    });
                    setBloqueSeleccionado(null);
                    setForm({ nombre: "", correo: "", rut: "", edad: "", motivo: "", telefono: "", modalidad: "" });
                  } else {
                    toast.error(data.error || "Error al reservar");
                  }
                } catch (err) {
                  toast.error("Error al procesar la reserva");
                }
                setEnviando(false);
              }}>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-blue-800">Nombre completo</label>
                  <input className="form-control rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm bg-white text-blue-900" placeholder="Ej: Juan Pérez" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-blue-800">Correo electrónico</label>
                  <input className="form-control rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm bg-white text-blue-900" placeholder="Ej: correo@email.com" type="email" value={form.correo} onChange={e => setForm(f => ({ ...f, correo: e.target.value }))} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-blue-800">RUT</label>
                  <input className="form-control rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm bg-white text-blue-900" placeholder="Ej: 12.345.678-9" value={form.rut} onChange={e => setForm(f => ({ ...f, rut: e.target.value }))} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-blue-800">Edad</label>
                  <input className="form-control rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm bg-white text-blue-900" placeholder="Ej: 30" type="number" min="0" value={form.edad} onChange={e => setForm(f => ({ ...f, edad: e.target.value }))} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-blue-800">Teléfono</label>
                  <input className="form-control rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm bg-white text-blue-900" placeholder="Ej: +56912345678" type="tel" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-blue-800">Modalidad</label>
                  <select className="form-control rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm bg-white text-blue-900" value={form.modalidad} onChange={e => setForm(f => ({ ...f, modalidad: e.target.value }))} required>
                    <option value="">Selecciona una opción</option>
                    <option value="online">Online</option>
                    <option value="presencial">Presencial</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold text-blue-800">Motivo de consulta</label>
                  <textarea className="form-control rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm bg-white text-blue-900" rows={3} placeholder="Describe brevemente el motivo de tu consulta" value={form.motivo} onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))} required />
                </div>
              </div>
              <div className="d-flex gap-3 mt-4 justify-content-end">
                <button type="button" className="btn px-4 py-2 rounded-xl border-2 border-blue-400 text-blue-700 bg-white hover:bg-blue-50 shadow-sm fw-semibold" onClick={() => setBloqueSeleccionado(null)} disabled={enviando}>Cancelar</button>
                <button type="submit" className="btn px-4 py-2 rounded-xl border-0 text-white fw-bold bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 shadow" disabled={enviando}>
                  {enviando ? 'Enviando...' : 'Confirmar reserva'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      {resumenReserva && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{background: "rgba(0,0,0,0.3)", zIndex: 9999}}>
          <div className="bg-white rounded-4 shadow-lg p-4" style={{maxWidth: 400, minWidth: 320}}>
            <h4 className="text-success fw-bold mb-3 text-center">Reserva confirmada</h4>
            {displayName && (
              <div className="mb-2"><b>Bienvenido:</b> {displayName}</div>
            )}
            <div className="mb-2"><b>Psicólogo:</b> {psicologoNombre}</div>
            <div className="mb-2"><b>Nombre:</b> {resumenReserva.nombre}</div>
            <div className="mb-2"><b>Correo:</b> {resumenReserva.correo}</div>
            <div className="mb-2"><b>Teléfono:</b> {resumenReserva.telefono}</div>
            <div className="mb-2"><b>Modalidad:</b> {resumenReserva.modalidad}</div>
            <div className="mb-2"><b>Fecha:</b> {resumenReserva.fecha}</div>
            <div className="mb-2"><b>Hora:</b> {resumenReserva.hora}{resumenReserva.hora_fin ? ` - ${resumenReserva.hora_fin}` : ""}</div>
            <div className="mb-2"><b>Motivo:</b> {resumenReserva.motivo}</div>
            <button className="btn btn-primary w-100 mt-3" onClick={() => { setResumenReserva(null); navigate('/search'); }}>Cerrar</button>
          </div>
        </div>
      )}
      <Toaster position="bottom-right" reverseOrder={false} />
    </div>
  );
}