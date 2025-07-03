// src/components/DashboardPs.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";
import toast, { Toaster } from "react-hot-toast";

function DashboardNavbar() {
  const navigate = useNavigate();
  const isLogged = !!localStorage.getItem("token");
  let usuarioInfo = null;

  if (isLogged) {
    try {
      usuarioInfo = JSON.parse(localStorage.getItem("user"));
    } catch {
      usuarioInfo = null;
    }
  }

  return (
    <nav className="navbar navbar-expand-lg custom-navbar shadow-sm px-4">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg"
            alt="Logo"
            style={{ width: 44, height: 44, marginRight: 10 }}
          />
          <span className="navbar-brand mb-0 h1 fs-4 fw-bold text-light">
            WebPsicologos
          </span>
        </div>
        <div className="d-flex align-items-center">
          {isLogged && (
            <>
              <div
                className="bg-secondary rounded-circle d-flex align-items-center justify-content-center me-3"
                style={{ width: 42, height: 42, cursor: "pointer" }}
                title="Cuenta"
                onClick={() => navigate("/profile")}
              >
                {usuarioInfo && usuarioInfo.foto_url ? (
                  <img
                    src={usuarioInfo.foto_url}
                    alt="perfil"
                    className="rounded-circle"
                    style={{ width: 40, height: 40, objectFit: "cover" }}
                  />
                ) : (
                  <i className="bi bi-person fs-3 text-white" />
                )}
              </div>
              <button
                className="btn btn-link text-white fs-4 p-0"
                title="Cerrar sesión"
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  navigate("/");
                }}
              >
                <i className="bi bi-box-arrow-right"></i>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function DashboardPs() {
  const [eventos, setEventos] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

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
            backgroundColor: ev.disponible ? "#007bff" : "#dc3545",
            editable: ev.disponible,
            extendedProps: { disponible: ev.disponible }
          };
        });
        setEventos(eventosFormateados);
      } else {
        toast.error("No se pudieron cargar los horarios");
      }
    } catch (e) {
      console.error("Error cargando horarios:", e);
      toast.error("Error al cargar los horarios");
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  const handleSelect = async (info) => {
    const start = dayjs(info.start);
    const end = dayjs(info.end);
    const diffMin = end.diff(start, 'minute');

    if (diffMin !== 30 && diffMin !== 60) {
      toast.error("Solo puedes agregar bloques de 30 o 60 minutos");
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
    } catch (err) {
      toast.error("Error al guardar la disponibilidad");
    }
  };

  const handleEventClick = async (clickInfo) => {
    const id = clickInfo.event.id;
    const disponible = clickInfo.event.extendedProps.disponible;
    if (!disponible) return;

    if (window.confirm("¿Deseas eliminar este horario?")) {
      try {
        await fetch(`http://localhost:5000/api/horarios/${id}`, { method: "DELETE" });
        toast.success("Bloque eliminado");
        fetchEventos();
      } catch (err) {
        toast.error("Error al eliminar el bloque");
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
    } catch (err) {
      toast.error("Error al mover el bloque");
    }
  };

  const repetir4Semanas = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/horarios/repetir/${user.id}`, {
        method: "POST"
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Semana replicada 4 veces");
        fetchEventos();
      } else {
        toast.error("No se pudo repetir la semana");
      }
    } catch (err) {
      toast.error("Error al repetir bloques");
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <DashboardNavbar />
      <div className="container my-5">
        <h4 className="mb-4 fw-bold">Gestión de Disponibilidad Semanal</h4>
        <button onClick={repetir4Semanas} className="btn btn-outline-success mb-3">
          Repetir esta semana por 4 semanas
        </button>

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
      <Toaster position="bottom-right" reverseOrder={false} />
    </div>
  );
}
