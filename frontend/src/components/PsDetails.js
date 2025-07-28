import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./Header";

export default function PsDetailsModern() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [psicologo, setPsicologo] = useState(null);
  const [proximaHora, setProximaHora] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPsicologo = async () => {
      try {
        const resp = await fetch(`http://localhost:5000/api/psychologists/${id}`);
        const data = await resp.json();
        if (data.success) setPsicologo(data.psicologo);
        else setPsicologo(null);
      } catch {
        setPsicologo(null);
      }
      setLoading(false);
    };

    const getProximaHora = async () => {
      try {
        const resp = await fetch(`http://localhost:5000/api/horarios/psicologo/${id}`);
        const data = await resp.json();
        if (data.success) {
          const disponibles = data.data.filter(h => h.disponible);
          if (disponibles.length > 0) {
            disponibles.sort((a, b) => new Date(`${a.fecha}T${a.hora}`) - new Date(`${b.fecha}T${b.hora}`));
            setProximaHora(disponibles[0]);
          }
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
              src={psicologo.foto_url || 'https://via.placeholder.com/140'}
              alt="Perfil"
              className="w-40 h-40 rounded-full object-cover border-4 border-blue-300 shadow-md"
            />
            <div className="flex-1 w-full">
              <h2 className="text-3xl font-extrabold text-blue-800 mb-2">{psicologo.nombre} {psicologo.apellido}</h2>
              <p className="text-blue-600 font-semibold mb-2">{psicologo.descripcion || 'Especialización no disponible'}</p>
              <p className="text-gray-700 mb-2">{psicologo.universidad || 'Universidad no disponible'}</p>

              <div className="flex items-center justify-between mt-4 flex-wrap md:flex-nowrap gap-3">
                <p className="text-green-600 font-semibold mb-2 md:mb-0">
                  {proximaHora ? (
                    <>🟢 Próxima hora: {new Date(`${proximaHora.fecha}T${proximaHora.hora}`).toLocaleString("es-CL", {
                      weekday: "long", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                    })}</>
                  ) : (
                    <>No hay horas disponibles</>
                  )}
                </p>

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
                {(psicologo.areas || ["Sin información"]).map((area, i) => (
                  <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">{area}</span>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl shadow border border-blue-100">
              <h3 className="text-xl font-bold text-blue-700 mb-3">Enfoque Terapéutico</h3>
              <p className="text-gray-700">{psicologo.enfoque || 'Sin información disponible'}</p>
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl shadow border border-blue-100">
              <h3 className="text-xl font-bold text-blue-700 mb-3">Formación Académica</h3>
              <ul className="list-disc list-inside text-gray-700">
                {(psicologo.formacion || ["Sin información"]).map((f, i) => (<li key={i}>{f}</li>))}
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
              <p className="text-gray-700">{psicologo.idiomas || 'Sin información disponible'}</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-2xl shadow border border-blue-100">
              <h3 className="text-xl font-bold text-blue-700 mb-3">Tarifas y Pago</h3>
              <p className="text-gray-700">{psicologo.tarifas || 'Sin información disponible'}</p>
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
