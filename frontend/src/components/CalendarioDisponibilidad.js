import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";

const CalendarioDisponibilidad = ({ eventos, onAgregar, onEliminar }) => {
  const [calendarEvents, setCalendarEvents] = useState(eventos || []);

  const handleDateSelect = (info) => {
    const nuevaDisponibilidad = {
      id: String(new Date().getTime()),
      title: "Disponibilidad",
      start: info.startStr,
      end: info.endStr,
    };

    setCalendarEvents([...calendarEvents, nuevaDisponibilidad]);

    if (onAgregar) onAgregar(nuevaDisponibilidad);
  };

  const handleEventClick = (info) => {
    const confirmacion = window.confirm("¿Eliminar este bloque de disponibilidad?");
    if (confirmacion) {
      const filtrados = calendarEvents.filter(e => e.id !== info.event.id);
      setCalendarEvents(filtrados);
      if (onEliminar) onEliminar(info.event.id);
    }
  };

  return (
    <div className="p-4">
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable={true}
        editable={false}
        allDaySlot={false}
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        events={calendarEvents}
        select={handleDateSelect}
        eventClick={handleEventClick}
        height="auto"
      />
    </div>
  );
};

export default CalendarioDisponibilidad;
