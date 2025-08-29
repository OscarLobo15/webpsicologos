import React, { useEffect } from "react";

export default function CalendarModal({ isOpen, onClose, onSave, values, setValues }) {
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div
        className="absolute inset-0 bg-transparent pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border-2 border-blue-200 pointer-events-auto animate-fadeIn"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center gap-2">
          <span className="inline-block bg-blue-100 text-blue-600 rounded-full p-2 text-xl">📅</span>
          Nuevo bloque
        </h2>
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); onSave(); }}>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Fecha</label>
              <input type="date" value={values.fecha} onChange={e => setValues(v => ({ ...v, fecha: e.target.value }))} className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-300" required />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Hora inicio</label>
              <input type="time" value={values.hora} onChange={e => setValues(v => ({ ...v, hora: e.target.value }))} className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-300" required />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Hora fin</label>
              <input type="time" value={values.hora_fin} onChange={e => setValues(v => ({ ...v, hora_fin: e.target.value }))} className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-300" required />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Descripción</label>
            <input type="text" value={values.descripcion} onChange={e => setValues(v => ({ ...v, descripcion: e.target.value }))} className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-300" placeholder="Ej: Sesión presencial, online, etc." />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Tipo de bloque</label>
            <select
              value={values.tipo}
              onChange={e => setValues(v => ({ ...v, tipo: e.target.value }))}
              className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-300"
              required
            >
              <option value="disponible">🟢 Horario disponible</option>
              <option value="reunion">📅 Reunión</option>
              <option value="reserva">🔵 Reserva</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="block text-xs text-gray-500">Color</label>
            <input type="color" value={values.color} onChange={e => setValues(v => ({ ...v, color: e.target.value }))} className="w-10 h-8 p-0 border-none bg-transparent" />
          </div>
          <div className="flex gap-2 mt-6">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2 font-semibold transition">Cancelar</button>
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-semibold shadow transition">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
