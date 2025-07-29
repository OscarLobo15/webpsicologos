import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";
import toast, { Toaster } from "react-hot-toast";
import HeaderDashboard from "../Components/HeaderDashboard";

export default function DashboardPs() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [eventos, setEventos] = useState([]);
  const [citasSemana, setCitasSemana] = useState(0);
  const [pacientesNuevos, setPacientesNuevos] = useState(0);
  const [sesionesMes, setSesionesMes] = useState(0);
  const [proximasCitas, setProximasCitas] = useState([]);
  const [gananciaTeorica, setGananciaTeorica] = useState(0);
  const [gananciaAjustada, setGananciaAjustada] = useState(0);

  const fetchEventos = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/horarios/psicologo/${user.id}`);
      const json = await res.json();
      if (json.success) {
        const eventosFormateados = json.data.map(ev => {
          const horaLimpia = ev.hora.slice(0, 5);
          return {
            id: ev.id,
            title: ev.disponible ? "🟦 Disponible" : "🔴 Reservado",
            start: `${ev.fecha}T${horaLimpia}`,
            end: dayjs(`${ev.fecha}T${horaLimpia}`).add(1, "hour").toISOString(),
            backgroundColor: ev.disponible ? "#3b82f6" : "#dc2626",
            editable: ev.disponible,
            extendedProps: { disponible: ev.disponible }
          };
        });
        setEventos(eventosFormateados);
      } else {
        toast.error("No se pudieron cargar los horarios");
      }
    } catch {
      toast.error("Error al cargar los horarios");
    }
  };

  const fetchDashboardInfo = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/dashboard/info/${user.id}`);
      const json = await res.json();
      if (json.success) {
        setCitasSemana(json.data.citasSemana);
        setPacientesNuevos(json.data.pacientesNuevos);
        setSesionesMes(json.data.sesionesMes);
        setProximasCitas(json.data.proximasCitas);
        setGananciaTeorica(json.data.gananciaTeorica);
        setGananciaAjustada(json.data.gananciaAjustada);
      }
    } catch {
      toast.error("Error al cargar datos del dashboard");
    }
  };

  useEffect(() => {
    fetchEventos();
    fetchDashboardInfo();
  }, []);

  const handleSelect = async (info) => {
    const start = dayjs(info.start);
    const end = dayjs(info.end);

    if (![30, 60].includes(end.diff(start, 'minute'))) {
      toast.error("Solo bloques de 30 o 60 minutos");
      return;
    }

    const fecha = start.format("YYYY-MM-DD");
    const hora = start.format("HH:mm");

    try {
      await fetch(`http://localhost:5000/api/horarios/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fecha, hora, disponible: true })
      });
      toast.success("Bloque agregado");
      fetchEventos();
    } catch {
      toast.error("Error al guardar disponibilidad");
    }
  };

  const handleEventClick = async (clickInfo) => {
    const id = clickInfo.event.id;
    const disponible = clickInfo.event.extendedProps.disponible;
    if (!disponible) return;

    if (window.confirm("¿Eliminar este horario?")) {
      try {
        await fetch(`http://localhost:5000/api/horarios/${id}`, { method: "DELETE" });
        toast.success("Bloque eliminado");
        fetchEventos();
      } catch {
        toast.error("Error al eliminar bloque");
      }
    }
  };

  const handleEventDrop = async (info) => {
    const id = info.event.id;
    const nuevaFecha = dayjs(info.event.start).format("YYYY-MM-DD");
    const nuevaHora = dayjs(info.event.start).format("HH:mm");

    try {
      await fetch(`http://localhost:5000/api/horarios/${id}`, { method: "DELETE" });
      await fetch(`http://localhost:5000/api/horarios/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fecha: nuevaFecha, hora: nuevaHora, disponible: true })
      });
      toast.success("Bloque movido");
      fetchEventos();
    } catch {
      toast.error("Error al mover bloque");
    }
  };

  const repetir4Semanas = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/horarios/repetir/${user.id}`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        toast.success("Semana replicada 4 veces");
        fetchEventos();
      } else {
        toast.error("No se pudo repetir la semana");
      }
    } catch {
      toast.error("Error al repetir bloques");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-6 py-8 pt-28">
      <HeaderDashboard nombre={user?.nombre} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SummaryCard title="Sesiones esta semana" value={citasSemana} />
        <SummaryCard title="Pacientes nuevos" value={pacientesNuevos} />
        <SummaryCard title="Total de sesiones" value={sesionesMes} />
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-lg mb-8">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xl font-bold text-blue-800">Mi Calendario</h4>
          <button onClick={repetir4Semanas} className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700">
            Repetir semana x4
          </button>
        </div>

        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          selectable={true}
          selectMirror={true}
          select={handleSelect}
          events={eventos}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          editable={true}
          slotDuration="00:30:00"
          slotMinTime="08:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          height="auto"
          locale="es"
          nowIndicator={true}
          eventOverlap={false}
          eventDisplay="block"
          headerToolbar={{ start: "prev,next today", center: "title", end: "" }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h4 className="text-lg font-bold text-blue-800 mb-4">Próximas Citas</h4>
          <ul className="space-y-3">
            {proximasCitas.map((cita, index) => (
              <li key={index} className="flex justify-between items-center bg-blue-50 p-3 rounded-xl">
                <div>
                  <p className="font-semibold text-blue-700">{cita.nombre_paciente}</p>
                  <p className="text-sm text-blue-600">{dayjs(cita.fecha).format("dddd DD/MM")} • {cita.hora} • {cita.modalidad}</p>
                </div>
                <span className="text-sm font-medium text-gray-500">{cita.estado}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h4 className="text-lg font-bold text-blue-800 mb-4">Reportes Monetarios</h4>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-green-100 p-4 rounded-xl text-center">
              <p className="text-blue-900 font-semibold mb-2">Ganancia Total Estimada</p>
              <p className="text-3xl font-bold text-green-700">${gananciaTeorica}</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-xl text-center">
              <p className="text-blue-900 font-semibold mb-2">Ganancia (90%)</p>
              <p className="text-3xl font-bold text-yellow-600">${gananciaAjustada}</p>
            </div>
          </div>
        </div>
      </div>

      <Toaster position="bottom-right" reverseOrder={false} />
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="bg-blue-100 p-4 rounded-2xl shadow text-center">
      <h4 className="font-semibold text-blue-800 mb-2">{title}</h4>
      <p className="text-3xl font-bold text-blue-600">{value}</p>
    </div>
  );
}
