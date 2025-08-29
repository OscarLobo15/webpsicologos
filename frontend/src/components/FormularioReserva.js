// src/components/FormularioReserva.jsx
import React, { useState } from "react";

export default function FormularioReserva({ psicologo_id, fecha, hora }) {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    modalidad: "",
    motivo: ""
  });
  const [mensaje, setMensaje] = useState(null);
  const [enviado, setEnviado] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/reservas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        psicologo_id,
        fecha,
        hora
      })
    });
    const data = await res.json();
    if (data.success) {
      setEnviado(true);
      setMensaje("Reserva confirmada con éxito.");
    } else {
      setMensaje("Ocurrió un error. Intenta nuevamente.");
    }
  };

  if (enviado) {
    return <div className="alert alert-success">{mensaje}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <h4 className="mb-3">Completa tus datos</h4>
      {mensaje && <div className="alert alert-info">{mensaje}</div>}
      <div className="mb-3">
        <label className="form-label">Nombre completo</label>
        <input
          type="text"
          className="form-control"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Correo electrónico</label>
        <input
          type="email"
          className="form-control"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Teléfono</label>
        <input
          type="text"
          className="form-control"
          name="telefono"
          value={form.telefono}
          onChange={handleChange}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Modalidad</label>
        <select
          className="form-select"
          name="modalidad"
          value={form.modalidad}
          onChange={handleChange}
          required
        >
          <option value="">Selecciona una</option>
          <option value="online">Online</option>
          <option value="presencial">Presencial</option>
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label">Motivo de consulta</label>
        <textarea
          className="form-control"
          name="motivo"
          value={form.motivo}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary">
        Confirmar reserva
      </button>
    </form>
  );
}
