// Nuevo Dashboard del Psicólogo con diseño simplificado, informativo y funcional
import React, { useState, useEffect } from "react";
import CalendarModal from "../Components/CalendarModal";
import ReservationDetailModal from "../Components/ReservationDetailModal";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";
import 'dayjs/locale/es';
import relativeTime from 'dayjs/plugin/relativeTime';
import toast, { Toaster } from "react-hot-toast";
import HeaderDashboard from "../Components/HeaderDashboard";

export default function DashboardPs() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  
  // Configure dayjs
  dayjs.locale('es');
  dayjs.extend(relativeTime);




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
  const [reservationModalOpen, setReservationModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
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
    const isBloqueado = event.extendedProps.bloqueado;
    const tipo = event.extendedProps.tipo || (isDisponible ? 'disponible' : isBloqueado ? 'bloqueado' : 'reservado');
    
    // Log para depuración
    console.log(`[DEBUG] Renderizando evento ID ${event.id}:`, {
      title: event.title,
      disponible: isDisponible,
      bloqueado: isBloqueado,
      tipo: tipo,
      paciente: event.extendedProps.paciente,
      modalidad: event.extendedProps.modalidad
    });
    
    // Colores según el tipo de evento
    let bgColor = 'bg-blue-500';
    let textColor = 'text-blue-900';
    let label = 'Reservado';
    
    if (isDisponible) {
      bgColor = 'bg-green-500';
      textColor = 'text-green-700';
      label = 'Disponible';
    } else if (isBloqueado) {
      bgColor = 'bg-red-500';
      textColor = 'text-red-700';
      label = 'Bloqueado';
    }
    
    return (
      <div className="flex flex-col px-1 py-0.5">
        <div className="flex items-center">
          <div className={`w-2.5 h-2.5 rounded-full mr-1.5 ${bgColor}`}></div>
          <span className={`font-semibold text-xs ${textColor}`}>
            {label}
          </span>
        </div>
        {!isDisponible && !isBloqueado && event.extendedProps.paciente && (
          <span className="text-xs text-blue-700">Paciente: {event.extendedProps.paciente}</span>
        )}
        {!isDisponible && !isBloqueado && event.extendedProps.modalidad && (
          <span className="text-xs text-blue-500">Modalidad: {event.extendedProps.modalidad}</span>
        )}
      </div>
    );
  };


  // Función para obtener y mapear eventos del calendario
  const obtenerEventos = async () => {
    try {
      const token = localStorage.getItem("token");
      // Añadir un parámetro de caché para evitar problemas con caché del navegador
      const timestamp = new Date().getTime();
      const res = await fetch(`http://localhost:5000/api/horarios/${user.id}?t=${timestamp}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        if (!json.data || json.data.length === 0) {
          setEventos([]);
          toast("No hay bloques de disponibilidad", { icon: "ℹ️" });
          return;
        }
        const eventos = json.data.map(ev => {
          
          const horaLimpia = ev.hora ? ev.hora.slice(0, 5) : "00:00";
          const horaFin = ev.hora_fin ? ev.hora_fin : dayjs(`${ev.fecha}T${horaLimpia}`).add(1, "hour").format("HH:mm");
          let title = "";
          let bg = "";
          let border = "";
          let textColor = "";
          
          // Determinar el tipo de bloque basado en la lógica:
          // 1. Si disponible=true -> verde (disponible)
          // 2. Si disponible=false y hay reserva -> azul (reservado)
          // 3. Si disponible=false y no hay reserva -> rojo (bloqueado)
          const tipo = ev.tipo || (ev.disponible ? 'disponible' : ev.bloqueado ? 'bloqueado' : 'reservado');
          
          if (ev.disponible) {
            // Bloque disponible (verde)
            title = `🟢 Disponible`;
            bg = "#e0fce0";
            border = "#22c55e";
            textColor = "#166534";
          } else if (ev.bloqueado || tipo === 'bloqueado') {
            // Bloque bloqueado por el psicólogo (rojo)
            title = `🔴 Bloqueado`;
            bg = "#fee2e2"; // Fondo rojo claro
            border = "#ef4444"; // Borde rojo
            textColor = "#b91c1c"; // Texto rojo oscuro
          } else {
            // Bloque reservado por un paciente (azul)
            title = `🔵 ${ev.paciente_nombre || "Reservado"}${ev.modalidad ? ` (${ev.modalidad})` : ""}`;
            bg = "#e0e7ff";
            border = "#3b82f6";
            textColor = "#1e40af";
          }
          
          return {
            id: ev.id,
            title,
            start: `${ev.fecha}T${horaLimpia}`,
            end: `${ev.fecha}T${horaFin}`,
            backgroundColor: bg,
            borderColor: border,
            textColor: textColor,
            editable: ev.disponible,
            extendedProps: { 
              disponible: ev.disponible, 
              bloqueado: ev.bloqueado || false,
              paciente: ev.paciente_nombre, 
              modalidad: ev.modalidad 
            }
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
              const eventInfo = e.event;
              const tipo = eventInfo.extendedProps.tipo || 
                           (eventInfo.extendedProps.disponible ? 'disponible' : 
                            eventInfo.extendedProps.bloqueado ? 'bloqueado' : 'reservado');
              
              const eventStart = dayjs(eventInfo.start);
              const eventEnd = dayjs(eventInfo.end);
              
              // Preparar datos básicos del evento que son comunes para todos los tipos
              const eventoBase = {
                id: eventInfo.id,
                fecha: eventStart.format('YYYY-MM-DD'),
                hora: eventStart.format('HH:mm'),
                hora_fin: eventEnd.format('HH:mm'),
                tipo: tipo
              };
              
              if (eventInfo.extendedProps.disponible || tipo === 'disponible') {
                // Si es un bloque disponible (verde), mostrar opciones en un modal
                setSelectedReservation({
                  ...eventoBase,
                  esDisponible: true,
                  esBloqueado: false
                });
                setReservationModalOpen(true);
              } else if (eventInfo.extendedProps.bloqueado || tipo === 'bloqueado') {
                // Si es un bloque bloqueado (rojo), mostrar opciones para desbloquear
                setSelectedReservation({
                  ...eventoBase,
                  esDisponible: false,
                  esBloqueado: true
                });
                setReservationModalOpen(true);
              } else {
                // Si es una reserva (azul), mostrar el modal con detalles
                
                // Buscar los datos completos de la reserva
                const token = localStorage.getItem("token");
                try {
                  // Añadir parámetro de caché para evitar datos antiguos
                  const timestamp = new Date().getTime();
                  const res = await fetch(`http://localhost:5000/api/reservas/${eventInfo.id}?t=${timestamp}`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  const json = await res.json();
                  
                  if (json.success && json.reserva) {
                    setSelectedReservation({
                      ...json.reserva,
                      id: eventInfo.id,
                      fecha: eventStart.format('YYYY-MM-DD'),
                      nombre_paciente: eventInfo.extendedProps.paciente || json.reserva.nombre_paciente,
                      modalidad: eventInfo.extendedProps.modalidad || json.reserva.modalidad
                    });
                    setReservationModalOpen(true);
                  } else {
                    // Si no se encuentra la reserva específica, mostrar los datos básicos que tenemos
                    setSelectedReservation({
                      id: eventInfo.id,
                      fecha: eventStart.format('YYYY-MM-DD'),
                      hora: eventStart.format('HH:mm'),
                      hora_fin: dayjs(eventInfo.end).format('HH:mm'),
                      nombre_paciente: eventInfo.extendedProps.paciente || "Paciente",
                      modalidad: eventInfo.extendedProps.modalidad || "No especificada"
                    });
                    setReservationModalOpen(true);
                  }
                } catch (err) {
                  console.error("Error obteniendo detalles de reserva:", err);
                  // Mostrar al menos los datos básicos que tenemos
                  setSelectedReservation({
                    id: eventInfo.id,
                    fecha: eventStart.format('YYYY-MM-DD'),
                    hora: eventStart.format('HH:mm'),
                    hora_fin: dayjs(eventInfo.end).format('HH:mm'),
                    nombre_paciente: eventInfo.extendedProps.paciente || "Paciente",
                    modalidad: eventInfo.extendedProps.modalidad || "No especificada"
                  });
                  setReservationModalOpen(true);
                }
              }
            }}
          />
        </div>


      </div>

      <div className="bg-white p-5 rounded-3xl shadow-lg mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-blue-800">Próximas Citas</h2>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            <span className="text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">Agendado</span>
          </div>
        </div>
        
        {resumen.proximasCitas && resumen.proximasCitas.length > 0 ? (
          <div className="space-y-3">
            {resumen.proximasCitas.map((cita, i) => {
              // Verificar que la cita no haya pasado ya
              const citaFecha = dayjs(cita.fecha);
              const ahora = dayjs();
              const esCitaFutura = citaFecha.isAfter(ahora) || 
                                  (citaFecha.isSame(ahora, 'day') && 
                                   dayjs(cita.fecha).format('HH:mm') >= ahora.format('HH:mm'));
              
              // No renderizar citas pasadas
              if (!esCitaFutura) return null;
              
              // Calcular tiempo hasta la cita
              const diasFaltantes = citaFecha.diff(ahora, 'day');
              let proximidadClase = 'bg-blue-100 text-blue-800'; // por defecto
              
              if (citaFecha.isSame(ahora, 'day')) {
                proximidadClase = 'bg-green-100 text-green-800'; // hoy
              } else if (diasFaltantes <= 2) {
                proximidadClase = 'bg-yellow-100 text-yellow-800'; // próximos 2 días
              }
              
              return (
                <div key={i} className="bg-white border border-blue-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    {/* Información del paciente */}
                    <div className="flex items-center">
                      <div className="bg-blue-600 text-white rounded-full w-9 h-9 flex items-center justify-center mr-3 shrink-0 shadow-sm">
                        {cita.nombre_paciente.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-medium text-blue-900 text-sm">{cita.nombre_paciente} {cita.edad && <span className="text-blue-600">({cita.edad} años)</span>}</h3>
                        <p className="text-xs text-blue-600">{cita.motivo || 'Consulta psicológica'}</p>
                      </div>
                    </div>
                    
                    {/* Fecha, hora y modalidad */}
                    <div className="flex items-center gap-3">
                      {/* Fecha/hora */}
                      <div className="flex items-center bg-blue-50 px-3 py-1.5 rounded-lg">
                        <svg className="w-4 h-4 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium text-blue-800">
                          {dayjs(cita.fecha).isSame(dayjs(), 'day') 
                            ? 'Hoy'
                            : dayjs(cita.fecha).isSame(dayjs().add(1, 'day'), 'day')
                              ? 'Mañana'
                              : dayjs(cita.fecha).format("D MMM")
                          },
                          <span className="ml-1 font-semibold">{dayjs(cita.fecha).format("HH:mm")}</span>
                        </span>
                      </div>
                      
                      {/* Modalidad */}
                      <div>
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm ${proximidadClase}`}>
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                              d={cita.modalidad?.toLowerCase().includes('online') 
                                ? "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                : "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              }/>
                          </svg>
                          {cita.modalidad || 'Presencial'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Datos de contacto */}
                  <div className="border-t border-blue-50 mt-3 pt-3">
                    <div className="flex flex-wrap gap-3">
                      {cita.email_paciente && (
                        <div className="flex items-center text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg">
                          <svg className="w-3.5 h-3.5 mr-1.5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs text-gray-700 truncate max-w-[180px] md:max-w-[250px]">
                            {cita.email_paciente}
                          </span>
                        </div>
                      )}
                      
                      {cita.telefono && (
                        <div className="flex items-center text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg">
                          <svg className="w-3.5 h-3.5 mr-1.5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-xs text-gray-700">
                            {cita.telefono}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="inline-block bg-blue-50 rounded-full p-4 mb-4">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700">No tienes citas próximas programadas</h3>
            <p className="text-sm mt-2 text-gray-500 max-w-sm mx-auto">Los pacientes pueden reservar a través de la página pública de reservas</p>
          </div>
        )}
      </div>

      {/* Modal de detalle de reserva */}
      {reservationModalOpen && selectedReservation && (
        <ReservationDetailModal
          reservation={selectedReservation}
          onClose={() => {
            setReservationModalOpen(false);
            setSelectedReservation(null);
          }}
          onCancelReservation={async (reservaId, tipo) => {
            try {
              const token = localStorage.getItem("token");
              
              // Manejar bloques disponibles y bloqueados
              if (tipo === 'eliminar') {
                // Eliminar un bloque (sea disponible o bloqueado)
                const res = await fetch(`http://localhost:5000/api/horarios/${reservaId}`, {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` }
                });
                const json = await res.json();
                if (json.success) {
                  toast.success("Bloque eliminado correctamente");
                  obtenerEventos();
                  obtenerResumen();
                } else {
                  toast.error(json.message || "No se pudo eliminar el bloque");
                }
                return;
              } else if (tipo === 'bloquear') {
                // Convertir un bloque disponible en bloqueado
                const res = await fetch(`http://localhost:5000/api/horarios/${reservaId}/bloquear`, {
                  method: "PUT",
                  headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` 
                  }
                });
                const json = await res.json();
                if (json.success) {
                  toast.success("Bloque marcado como bloqueado");
                  obtenerEventos();
                  obtenerResumen();
                } else {
                  toast.error(json.message || "No se pudo bloquear el horario");
                }
                return;
              } else if (tipo === 'desbloquear') {
                // Convertir un bloque bloqueado en disponible
                const res = await fetch(`http://localhost:5000/api/horarios/${reservaId}/desbloquear`, {
                  method: "PUT",
                  headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` 
                  }
                });
                const json = await res.json();
                if (json.success) {
                  toast.success("Bloque marcado como disponible");
                  obtenerEventos();
                  obtenerResumen();
                } else {
                  toast.error(json.message || "No se pudo desbloquear el horario");
                }
                return;
              }
              
              // Manejar reservas normales (cancelación)
              const res = await fetch(`http://localhost:5000/api/reservas/${reservaId}/cancelar`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ 
                  tipo: tipo // 'liberar' o 'bloquear'
                })
              });
              
              const json = await res.json();
              
              if (json.success) {
                if (tipo === 'liberar') {
                  toast.success("Reserva cancelada. El bloque ha quedado disponible nuevamente.");
                } else {
                  toast.success("Reserva cancelada. El bloque ha sido bloqueado.");
                }
                // Recargar datos
                obtenerEventos();
                obtenerResumen();
              } else {
                toast.error(json.message || "No se pudo cancelar la reserva");
              }
            } catch (err) {
              console.error("Error al procesar la operación:", err);
              toast.error("Error al procesar la solicitud");
            }
          }}
        />
      )}
      
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
