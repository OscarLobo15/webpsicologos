import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import 'dayjs/locale/es';
import isoWeek from 'dayjs/plugin/isoWeek';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isoWeek);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export default function DisponibilidadPublica({ psicologoId, onSeleccionarBloque }) {
  const [bloques, setBloques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [semanaOffset, setSemanaOffset] = useState(0); // 0 = semana actual

  useEffect(() => {
    async function fetchBloques() {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch(
          `http://localhost:5000/api/horarios/${psicologoId}/disponibles`
        );
        const data = await resp.json();
        if (data.success) {
          setBloques(data.bloques || []);
        } else {
          setBloques([]);
          setError("No hay disponibilidad");
        }
      } catch (e) {
        setError("Error al cargar disponibilidad");
        setBloques([]);
      }
      setLoading(false);
    }
    if (psicologoId) fetchBloques();
  }, [psicologoId]);

  // Calcular rango de la semana a mostrar
  const startOfWeek = dayjs().add(semanaOffset, 'week').startOf('isoWeek');
  const endOfWeek = dayjs().add(semanaOffset, 'week').endOf('isoWeek');

  // Filtrar bloques solo de la semana seleccionada
  const bloquesSemana = bloques.filter(b => {
    const fecha = dayjs(b.fecha);
    return fecha.isSameOrAfter(startOfWeek, 'day') && fecha.isSameOrBefore(endOfWeek, 'day');
  });

  // Agrupar bloques de la semana por día (en español)
  const bloquesPorDia = bloquesSemana.reduce((acc, b) => {
    let fecha = dayjs(b.fecha).locale('es').format("dddd DD/MM");
    // Capitalizar la primera letra
    fecha = fecha.charAt(0).toUpperCase() + fecha.slice(1);
    if (!acc[fecha]) acc[fecha] = [];
    acc[fecha].push(b);
    return acc;
  }, {});

  // Ordenar días de la semana ascendente (lunes a domingo)
  const diasOrdenados = Object.keys(bloquesPorDia).sort((a, b) => {
    const getDayNum = d => {
      // Extraer el número de día de la fecha (lunes=1, domingo=7)
      const map = { 'lunes': 1, 'martes': 2, 'miércoles': 3, 'miercoles': 3, 'jueves': 4, 'viernes': 5, 'sábado': 6, 'sabado': 6, 'domingo': 7 };
      return map[d.split(' ')[0].toLowerCase()] || 8;
    };
    return getDayNum(a) - getDayNum(b);
  });

  if (loading) return <div className="text-center py-6">Cargando disponibilidad...</div>;
  if (error) return <div className="text-center text-red-500 py-6">{error}</div>;
  if (bloquesSemana.length === 0) return <div className="text-center py-6">No hay horas disponibles en esta semana.</div>;

  return (
    <div className="bg-blue-50 rounded-2xl p-6 shadow-md">
      <h3 className="text-xl font-bold text-blue-700 mb-4 text-center">Disponibilidad</h3>
      <div className="flex flex-col items-center mb-4 gap-2">
        <div className="flex justify-between w-full">
          <div>
            {semanaOffset > 0 && (
              <button className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold" onClick={() => setSemanaOffset(semanaOffset - 1)}>
                ← Semana anterior
              </button>
            )}
          </div>
          <div>
            <button className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold" onClick={() => setSemanaOffset(semanaOffset + 1)}>
              Semana siguiente →
            </button>
          </div>
        </div>
        <span className="font-semibold text-blue-700 text-center block text-lg" style={{minWidth:180}}>{startOfWeek.format('DD/MM')} - {endOfWeek.format('DD/MM')}</span>
      </div>
      <div className="space-y-6">
        {diasOrdenados.map((dia) => (
          <div key={dia}>
            <div className="font-semibold text-blue-600 mb-2">{dia}</div>
            <div className="flex flex-wrap gap-3">
              {bloquesPorDia[dia].map((b) => (
                <button
                  key={b.id}
                  className="px-4 py-2 rounded-xl bg-blue-100 border border-blue-300 text-blue-700 font-semibold shadow-sm hover:bg-blue-200 transition-all focus:outline-none focus:ring-2 focus:ring-blue-300"
                  onClick={() => onSeleccionarBloque(b)}
                >
                  {b.hora} {b.hora_fin ? `- ${b.hora_fin}` : ""}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
