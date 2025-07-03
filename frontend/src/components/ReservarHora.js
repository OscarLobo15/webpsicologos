import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";
import toast, { Toaster } from "react-hot-toast";

export default function ReservarHora() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [usuarioIdPsicologo, setUsuarioIdPsicologo] = useState(null);

  const fetchDisponibilidad = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/horarios/psicologo/${id}`);
      const json = await res.json();
      console.log("Respuesta del backend:", json);

      if (json.success) {
        const disponibles = json.data.map(ev => {
          const horaLimpia = ev.hora.slice(0, 5);
          return {
            id: ev.id,
            title: dayjs(`${ev.fecha}T${horaLimpia}`).format("HH:mm"),
            start: `${ev.fecha}T${horaLimpia}`,
            end: dayjs(`${ev.fecha}T${horaLimpia}`).add(1, "hour").toISOString(),
            backgroundColor: ev.disponible ? "#4da6ff" : "#ff4d4d",
            borderColor: "transparent",
            classNames: ["clickable-event"],
            extendedProps: {
              disponible: ev.disponible
            }
          };
        });

        setEventos(disponibles);
      } else {
        toast.error("Error al cargar disponibilidad");
      }
    } catch (err) {
      toast.error("Error al cargar horarios disponibles");
    }
  };

  const fetchUsuarioIdPsicologo = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/psychologists/${id}`);
      const json = await res.json();
      if (json.success && json.psicologo) {
        setUsuarioIdPsicologo(json.psicologo.usuario_id);
      }
    } catch (err) {
      toast.error("No se pudo obtener el perfil del psicólogo");
    }
  };

  useEffect(() => {
    fetchDisponibilidad();
    fetchUsuarioIdPsicologo();
  }, [id]);

  const handleEventClick = async (info) => {
    if (!info.event.extendedProps.disponible) return;

    const confirmar = window.confirm(`¿Deseas reservar esta hora con el psicólogo?`);
    if (!confirmar) return;

    const nombre = prompt("Nombre del paciente:");
    const email = prompt("Correo del paciente:");
    const telefono = prompt("Teléfono del paciente:");
    const modalidad = prompt("Modalidad (presencial/online):");
    const motivo = prompt("Motivo de la consulta:");

    if (!nombre || !email || !telefono || !modalidad || !motivo) {
      toast.error("Todos los campos son obligatorios para reservar.");
      return;
    }

    const horarioId = info.event.id;

    try {
      const res = await fetch(`http://localhost:5000/api/reservar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          horario_id: horarioId,
          psicologo_id: id,
          nombre_paciente: nombre,
          email_paciente: email,
          telefono: telefono,
          modalidad: modalidad,
          motivo: motivo
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Hora reservada con éxito");
        fetchDisponibilidad();
      } else {
        toast.error(data.error || "Error al reservar");
      }
    } catch (err) {
      toast.error("Error al procesar la reserva");
    }
  };

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
        <p className="text-muted text-center mb-3">
          Selecciona un bloque horario disponible para agendar tu sesión con el psicólogo.
        </p>

        <button className="btn btn-outline-secondary mb-3" onClick={volverAlPerfil}>
          ← Volver al perfil
        </button>

        <div className="card shadow-sm border-0">
          <div className="card-body">
            <FullCalendar
              plugins={[timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              events={eventos}
              eventClick={handleEventClick}
              slotDuration="00:30:00"
              slotMinTime="08:00:00"
              slotMaxTime="22:00:00"
              allDaySlot={false}
              height={"auto"}
              locale="es"
              nowIndicator={true}
              editable={false}
              selectable={false}
              validRange={{ start: dayjs().format("YYYY-MM-DD") }}
              headerToolbar={{ start: "prev,next today", center: "title", end: "" }}
              contentHeight={"auto"}
              eventClassNames={() => `cursor-pointer text-white text-center fw-semibold fs-6 square-block`}
              eventDidMount={(info) => {
                info.el.setAttribute("title", info.event.extendedProps.disponible ? "Disponible" : "Ocupada");
                info.el.style.cursor = "pointer";
              }}
            />
          </div>
        </div>
      </div>

      <Toaster position="bottom-right" reverseOrder={false} />

      <style>{`
        .fc-event.clickable-event {
          cursor: pointer;
          border: none;
          padding: 2px 0;
        }
        .fc-event-title {
          font-size: 0.8rem !important;
          padding: 0 !important;
        }
        .fc .fc-scrollgrid {
          border: none;
        }
        .fc .fc-timegrid-slot-label {
          font-size: 0.7rem;
        }
        .fc-theme-standard .fc-scrollgrid-section-header td {
          font-size: 0.75rem;
        }
        .fc .fc-timegrid-slot {
          height: 1.5em !important;
        }
        .fc .fc-toolbar-title {
          font-size: 1rem;
        }
        .square-block {
          border-radius: 0.4rem !important;
        }
      `}</style>
    </div>
  );
}