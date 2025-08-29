import React, { useEffect, useState } from "react";
import DisponibilidadPsicologo from "../Components/DisponibilidadPsicologo";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Components/Header";

export default function PsDetailsModern() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [psicologo, setPsicologo] = useState(null);
  const [proximaHora, setProximaHora] = useState(null);
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPsicologo = async () => {
      try {
        const resp = await fetch(`http://localhost:5000/api/psychologists/${id}`);
        const data = await resp.json();
        if (data.success) {
          // Procesar los datos para asegurar que los arrays sean consistentes
          const psicologoData = {
            ...data.psicologo,
            
            // Asegurar que áreas sea un array
            areas: (() => {
              if (data.psicologo.areas_atencion || data.psicologo.areas) {
                const areasData = data.psicologo.areas_atencion || data.psicologo.areas;
                if (Array.isArray(areasData)) {
                  return [...areasData];
                }
                if (typeof areasData === 'string') {
                  return areasData.split(',').map(item => item.trim()).filter(Boolean);
                }
              }
              return [];
            })(),
            
            // Asegurar que formación sea un array
            formacion: (() => {
              if (data.psicologo.formacion_academica || data.psicologo.formacion) {
                const formacionData = data.psicologo.formacion_academica || data.psicologo.formacion;
                if (Array.isArray(formacionData)) {
                  return [...formacionData];
                }
                if (typeof formacionData === 'string') {
                  return formacionData.split(',').map(item => item.trim()).filter(Boolean);
                }
              }
              return [];
            })(),
            
            // Asegurar que idiomas sea un array
            idiomas: (() => {
              if (data.psicologo.idiomas) {
                if (Array.isArray(data.psicologo.idiomas)) {
                  return [...data.psicologo.idiomas];
                }
                if (typeof data.psicologo.idiomas === 'string') {
                  return data.psicologo.idiomas.split(',').map(item => item.trim()).filter(Boolean);
                }
              }
              return [];
            })(),
            // Asegurar que modalidad_atencion sea un array
            modalidad_atencion: (() => {
              if (data.psicologo.modalidad_atencion) {
                if (Array.isArray(data.psicologo.modalidad_atencion)) {
                  return [...data.psicologo.modalidad_atencion];
                }
                if (typeof data.psicologo.modalidad_atencion === 'string') {
                  // Puede venir como string tipo 'Online,Presencial' o '["Online","Presencial"]'
                  try {
                    // Intenta parsear como JSON array
                    const parsed = JSON.parse(data.psicologo.modalidad_atencion);
                    if (Array.isArray(parsed)) return parsed.map(item => String(item).trim());
                  } catch {
                    // Si falla, parsea como string separada por coma
                    return data.psicologo.modalidad_atencion.split(',').map(item => item.replace(/\[|\]|"/g, '').trim()).filter(Boolean);
                  }
                }
              }
              return [];
            })()
          };
          
          setPsicologo(psicologoData);
        } else {
          setPsicologo(null);
        }
      } catch {
        setPsicologo(null);
      }
      setLoading(false);
    };

    const getProximaHora = async () => {
      try {
        const resp = await fetch(`http://localhost:5000/api/horarios/${id}/disponibles`);
        const data = await resp.json();
        if (data.success && Array.isArray(data.bloques)) {
          const ahora = new Date();
          const cuatroHorasDespues = new Date(ahora.getTime() + 4 * 60 * 60 * 1000);
          const disponibles = data.bloques
            .map(b => ({ ...b, fechaHora: new Date(`${b.fecha}T${b.hora}`) }))
            .filter(b => b.fechaHora > cuatroHorasDespues)
            .sort((a, b) => a.fechaHora - b.fechaHora);
          if (disponibles.length > 0) {
            setProximaHora(disponibles[0]);
          } else {
            setProximaHora(null);
          }
        } else {
          setProximaHora(null);
        }
      } catch {
        setProximaHora(null);
      }
    };

    getPsicologo();
    getProximaHora();
  }, [id]);

  if (loading) return <div className="text-center pt-32 text-gray-600">Cargando psicólogo...</div>;
  if (!psicologo) return <div className="text-center pt-32 text-gray-600">Psicólogo no encontrado</div>;

  // Si el usuario selecciona un bloque, redirigir al formulario de reserva con el bloque
  if (bloqueSeleccionado) {
    navigate(`/reservar/${psicologo.usuario_id}?bloqueId=${bloqueSeleccionado.id}`);
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8 pt-28">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-8">
          
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigate('/search')}
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              ← Volver al buscador
            </button>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
            <img
              src={psicologo.foto_path || psicologo.foto_url || 'https://via.placeholder.com/140'}
              alt="Perfil"
              className="w-40 h-40 rounded-full object-cover border-4 border-blue-300 shadow-md"
            />
            <div className="flex-1 w-full">
              <h2 className="text-3xl font-extrabold text-blue-800 mb-2">{psicologo.nombre} {psicologo.apellido}</h2>
              <p className="text-blue-600 font-semibold mb-2">{psicologo.descripcion || 'Especialización no disponible'}</p>
              <p className="text-gray-700 mb-2">{psicologo.universidad || 'Universidad no disponible'}</p>

              <div className="flex items-center justify-between mt-4 flex-wrap md:flex-nowrap gap-3">
                {proximaHora ? (
                  <p className="text-green-600 font-semibold mb-2 md:mb-0">
                    🟢 Próxima hora disponible: {new Date(`${proximaHora.fecha}T${proximaHora.hora}`).toLocaleString("es-CL", {
                      weekday: "long", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                    })}
                  </p>
                ) : (
                  <p className="text-red-600 font-semibold mb-2 md:mb-0">
                    No hay horas disponibles
                  </p>
                )}

                <button
                  onClick={() => navigate(`/reservar/${psicologo.usuario_id}`)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow hover:bg-blue-700 transition whitespace-nowrap"
                >
                  Reservar sesión
                </button>
              </div>

            </div>
          </div>



          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-blue-50 p-6 rounded-2xl shadow border border-blue-100">
              <h3 className="text-xl font-bold text-blue-700 mb-3">Áreas de atención</h3>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(psicologo.areas) && psicologo.areas.length > 0) ?
                  psicologo.areas.map((area, i) => (
                    <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {typeof area === 'string' ? area.replace(/["\[\]\n\r]/g, '').trim() : area}
                    </span>
                  )) :
                  <span className="text-gray-600">Sin información</span>
                }
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl shadow border border-blue-100">
              <h3 className="text-xl font-bold text-blue-700 mb-3">Enfoque Terapéutico</h3>
              <p className="text-gray-700">{psicologo.enfoque || 'Sin información disponible'}</p>
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl shadow border border-blue-100">
              <h3 className="text-xl font-bold text-blue-700 mb-3">Formación Académica</h3>
              <ul className="list-disc list-inside text-gray-700">
                {(Array.isArray(psicologo.formacion) && psicologo.formacion.length > 0) ?
                  psicologo.formacion.map((f, i) => (
                    <li key={i}>{typeof f === 'string' ? f.replace(/["\[\]\n\r]/g, '').trim() : f}</li>
                  )) :
                  <li className="text-gray-600">Sin información</li>
                }
              </ul>
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl shadow border border-blue-100">
              <h3 className="text-xl font-bold text-blue-700 mb-3">Experiencia Profesional</h3>
              <p className="text-gray-700">{psicologo.experiencia || 'Sin información disponible'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-blue-50 p-6 rounded-2xl shadow border border-blue-100">
              <h3 className="text-xl font-bold text-blue-700 mb-3">Idiomas</h3>
              <ul className="list-disc list-inside text-gray-700">
                {(Array.isArray(psicologo.idiomas) && psicologo.idiomas.length > 0) ?
                  psicologo.idiomas.map((idioma, i) => (
                    <li key={i}>{typeof idioma === 'string' ? idioma.replace(/["\[\]\n\r]/g, '').trim() : idioma}</li>
                  )) :
                  <li className="text-gray-600">Sin información</li>
                }
              </ul>
            </div>
            <div className="bg-blue-50 p-6 rounded-2xl shadow border border-blue-100">
              <h3 className="text-xl font-bold text-blue-700 mb-3">Tarifas y Pago</h3>
              <p className="text-gray-700">{psicologo.tarifas || 'Sin información disponible'}</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-2xl shadow border border-blue-100">
              <h3 className="text-xl font-bold text-blue-700 mb-3">Modalidades</h3>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(psicologo.modalidad_atencion) && psicologo.modalidad_atencion.length > 0) ?
                  psicologo.modalidad_atencion.map((mod, i) => (
                    <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {typeof mod === 'string' ? mod.replace(/["\[\]\n\r]/g, '').trim() : mod}
                    </span>
                  )) :
                  <span className="text-gray-600">Sin información disponible</span>
                }
              </div>
            </div>
          </div>

          <div className="text-center flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/search')}
              className="bg-white border border-blue-600 text-blue-600 px-8 py-3 rounded-xl shadow hover:bg-blue-50"
            >
              Volver al buscador
            </button>
            <button
              onClick={() => navigate(`/reservar/${psicologo.usuario_id}`)}
              className="bg-blue-600 text-white px-10 py-4 rounded-xl shadow-lg hover:bg-blue-700 transform hover:scale-105 transition"
            >
              Reservar Sesión
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
