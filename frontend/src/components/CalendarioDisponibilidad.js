// src/components/CalendarioDisponibilidad.jsx
import React from "react";

export default function CalendarioDisponibilidad({ fechas, onFechaSeleccionada }) {
  return (
    <div>
      <h4 className="mb-3">Selecciona una fecha disponible</h4>
      <div className="d-flex flex-wrap gap-3">
        {fechas.length > 0 ? (
          fechas.map((fecha, idx) => (
            <button
              key={idx}
              className="btn btn-outline-primary"
              onClick={() => onFechaSeleccionada(fecha)}
            >
              {new Date(fecha).toLocaleDateString("es-CL", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </button>
          ))
        ) : (
          <p>No hay fechas disponibles por ahora.</p>
        )}
      </div>
    </div>
  );
}