import React, { useEffect, useState } from "react";

const DisponibilidadPsicologo = ({ psicologoId, onSeleccionarBloque }) => {
  const [bloques, setBloques] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBloques = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/horarios/${psicologoId}`);
        const json = await res.json();
        const now = new Date();
        const disponibles = (json.data || []).filter(
          b => b.disponible && new Date(`${b.fecha}T${b.hora}`) > now
        );
        setBloques(disponibles);
      } catch (e) {
        setBloques([]);
      }
      setLoading(false);
    };
    fetchBloques();
  }, [psicologoId]);

  if (loading) return <div>Cargando disponibilidad...</div>;
  if (!bloques.length) return <div>No hay horarios disponibles.</div>;

  return (
    <div className="bg-white rounded shadow p-4 my-4">
      <h4 className="mb-2 font-semibold text-blue-700">Horarios disponibles</h4>
      <ul>
        {bloques.map(bloque => (
          <li
            key={bloque.id}
            className="flex items-center justify-between border-b py-2 cursor-pointer hover:bg-blue-50 rounded transition"
            onClick={() => onSeleccionarBloque(bloque)}
          >
            <span>
              {new Date(bloque.fecha).toLocaleDateString("es-CL", { weekday: "short", day: "2-digit", month: "2-digit" })} {bloque.hora} - {bloque.hora_fin}
            </span>
            <span className="text-xs text-green-600 font-bold">Disponible</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DisponibilidadPsicologo;
