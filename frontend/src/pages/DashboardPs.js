// Nuevo Dashboard del Psicólogo con diseño simplificado, informativo y funcional

import React, { useEffect, useState } from "react";
import CalendarModal from "../Components/CalendarModal";
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
  const [resumen, setResumen] = useState({
    citasSemana: 0,
    pacientesNuevos: 0,
    sesionesMes: 0,
    gananciaTeorica: 0,
    gananciaAjustada: 0,
    proximasCitas: [],
  });
  // Estado para el modal y el formulario de nuevo bloque
  const [modalOpen, setModalOpen] = useState(false);
  const [nuevoBloque, setNuevoBloque] = useState({
    fecha: dayjs().format("YYYY-MM-DD"),
    hora: "",
    hora_fin: "",
    color: "#22c55e",
    descripcion: "",
    tipo: "disponible"
  });

  // Render personalizado para eventos del calendario
  const renderEventContent = (eventInfo) => {
    const event = eventInfo.event;
    const isDisponible = event.extendedProps.disponible;
    return (
      <div className="flex flex-col px-1 py-0.5">
        <span className={`font-semibold text-xs ${isDisponible ? 'text-green-700' : 'text-blue-900'}`}>{event.title}</span>
        {!isDisponible && event.extendedProps.paciente && (
          <span className="text-xs text-blue-700">Paciente: {event.extendedProps.paciente}</span>
        )}
        {!isDisponible && event.extendedProps.modalidad && (
          <span className="text-xs text-blue-500">Modalidad: {event.extendedProps.modalidad}</span>
        )}
      </div>
    );
  };


  // Función para obtener y mapear eventos del calendario
  const obtenerEventos = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/horarios/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      console.log("[DEBUG] Respuesta de /api/horarios:", json); // <-- LOG DEBUG
      if (json.success) {
        if (!json.data || json.data.length === 0) {
          setEventos([]);
          toast("No hay bloques de disponibilidad", { icon: "ℹ️" });
          return;
        }
        const eventos = json.data.map(ev => {
          // Log de cada evento recibido
          console.log("[DEBUG] Evento recibido:", ev);
          const horaLimpia = ev.hora ? ev.hora.slice(0, 5) : "00:00";
          const horaFin = ev.hora_fin ? ev.hora_fin : dayjs(`${ev.fecha}T${horaLimpia}`).add(1, "hour").format("HH:mm");
          let title = "";
          let bg = "";
          let border = "";
          if (ev.disponible) {
            title = `🟢 Disponible`;
            bg = "#e0fce0";
            border = "#22c55e";
          } else {
            title = `🔵 ${ev.paciente_nombre || "Reservado"}${ev.modalidad ? ` (${ev.modalidad})` : ""}`;
            bg = "#e0e7ff";
            border = "#3b82f6";
          }
          return {
            id: ev.id,
            title,
            start: `${ev.fecha}T${horaLimpia}`,
            end: `${ev.fecha}T${horaFin}`,
            backgroundColor: bg,
            borderColor: border,
            textColor: ev.disponible ? "#166534" : "#1e40af",
            editable: ev.disponible,
            extendedProps: { disponible: ev.disponible, paciente: ev.paciente_nombre, modalidad: ev.modalidad }
          };
        });
        setEventos(eventos);
      } else {
        setEventos([]);
        toast.error(json.message || "No se pudieron cargar los bloques");
      }
    } catch (err) {
      setEventos([]);
      toast.error("Error cargando eventos");
      console.error("[DEBUG] Error en obtenerEventos:", err);
    }
  };

  const obtenerResumen = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/dashboard/info/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) setResumen(json.data);
      else toast.error(json.message || "No se pudo cargar el resumen");
    } catch {
      toast.error("Error cargando resumen");
    }
  };

  useEffect(() => {
    obtenerEventos();
    obtenerResumen();
  }, []);

  const agregarBloque = async () => {
    if (!nuevoBloque.fecha || !nuevoBloque.hora || !nuevoBloque.hora_fin) return toast.error("Completa fecha, hora inicio y fin");
    if (nuevoBloque.hora >= nuevoBloque.hora_fin) return toast.error("La hora de fin debe ser posterior a la de inicio");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/horarios/${user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          fecha: nuevoBloque.fecha,
          hora: nuevoBloque.hora,
          hora_fin: nuevoBloque.hora_fin,
          color: nuevoBloque.color,
          descripcion: nuevoBloque.descripcion,
          disponible: true
        })
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Bloque agregado");
        obtenerEventos();
        setModalOpen(false);
        setNuevoBloque({
          fecha: dayjs().format("YYYY-MM-DD"),
          hora: "",
          hora_fin: "",
          color: "#22c55e",
          descripcion: "",
          tipo: "disponible"
        });
      } else toast.error(json.message);
    } catch {
      toast.error("No se pudo guardar el bloque");
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 pt-24 px-4 md:px-10">
      <HeaderDashboard nombre={user?.nombre} />

      <h1 className="text-2xl md:text-3xl font-bold text-blue-900 mb-6">Mi Panel de Psicólogo</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <CardInfo titulo="Sesiones semana" valor={resumen.citasSemana} />
        <CardInfo titulo="Pacientes nuevos" valor={resumen.pacientesNuevos} />
        <CardInfo titulo="Sesiones mes" valor={resumen.sesionesMes} />
        <CardInfo titulo="Ganancia teórica" valor={`$${resumen.gananciaTeorica}`} />
        <CardInfo titulo="Ganancia 90%" valor={`$${resumen.gananciaAjustada}`} />
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-lg mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-blue-800">Bloques de disponibilidad</h2>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-semibold shadow transition"
            onClick={() => setModalOpen(true)}
          >
            + Nuevo bloque
          </button>
        </div>
        <CalendarModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={agregarBloque}
          values={nuevoBloque}
          setValues={setNuevoBloque}
        />

        <div className="rounded-2xl overflow-hidden border border-blue-200 shadow-sm mt-6">
          <FullCalendar
            plugins={[timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            locale="es"
            events={eventos}
            height="auto"
            allDaySlot={false}
            editable={true}
            selectable={true}
            selectMirror={true}
            slotDuration="00:30:00"
            slotMinTime="08:00:00"
            slotMaxTime="22:00:00"
            headerToolbar={{ start: "prev,next today", center: "title", end: "" }}
            nowIndicator={true}
            eventContent={renderEventContent}
            select={(info) => {
              setNuevoBloque({
                fecha: dayjs(info.start).format('YYYY-MM-DD'),
                hora: dayjs(info.start).format('HH:mm'),
                hora_fin: dayjs(info.end).format('HH:mm'),
                color: '#22c55e',
                descripcion: '',
                tipo: 'disponible'
              });
              setModalOpen(true);
            }}
            eventDrop={async (info) => {
              // Mover bloque: actualizar en la base de datos
              const event = info.event;
              if (!event.extendedProps.disponible) {
                toast.error("Solo puedes mover bloques disponibles");
                info.revert();
                return;
              }
              const fecha = dayjs(event.start).format('YYYY-MM-DD');
              const hora = dayjs(event.start).format('HH:mm');
              const hora_fin = dayjs(event.end).format('HH:mm');
              try {
                const token = localStorage.getItem("token");
                const res = await fetch(`http://localhost:5000/api/horarios/${event.id}`, {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                  },
                  body: JSON.stringify({ fecha, hora, hora_fin })
                });
                const json = await res.json();
                if (json.success) {
                  toast.success("Bloque actualizado");
                  obtenerEventos();
                } else {
                  toast.error(json.message);
                  info.revert();
                }
              } catch {
                toast.error("No se pudo actualizar el bloque");
                info.revert();
              }
            }}
            eventClick={async (e) => {
              if (!e.event.extendedProps.disponible) return;
              if (window.confirm("¿Eliminar este bloque disponible?")) {
                try {
                  const token = localStorage.getItem("token");
                  const res = await fetch(`http://localhost:5000/api/horarios/${e.event.id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  const json = await res.json();
                  if (json.success) {
                    toast.success("Bloque eliminado");
                    obtenerEventos();
                  } else {
                    toast.error(json.message);
                  }
                } catch {
                  toast.error("Error al eliminar");
                }
              }
            }}
          />
        </div>


      </div>

      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">Próximas Citas</h2>
        <ul className="divide-y divide-blue-100">
          {resumen.proximasCitas.map((cita, i) => (
            <li key={i} className="py-2">
              <div className="flex justify-between text-sm text-blue-800">
                <div>{cita.nombre_paciente} - {cita.modalidad}</div>
                <div>{dayjs(cita.fecha).format("DD/MM HH:mm")} - {cita.estado}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Toaster position="bottom-right" />
    </div>
  );
}

function CardInfo({ titulo, valor }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow text-center">
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className="text-xl font-bold text-blue-800">{valor}</p>
    </div>
  );
}
