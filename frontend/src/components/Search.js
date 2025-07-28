import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function Search() {
  const navigate = useNavigate();

  const [psicologos, setPsicologos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [debouncedBusqueda, setDebouncedBusqueda] = useState("");

  const [filtros, setFiltros] = useState({
    universidad: "",
    ciudad: "",
    comuna: "",
  });

  const [opciones, setOpciones] = useState({
    universidades: [],
    comunas: [],
  });

  // Debounce búsqueda
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedBusqueda(busqueda), 500);
    return () => clearTimeout(timeout);
  }, [busqueda]);

  useEffect(() => {
    const fetchOpciones = async () => {
      try {
        const [univRes, comRes] = await Promise.all([
          fetch("http://localhost:5000/api/location/universidades"),
          fetch("http://localhost:5000/api/location/comunas")
        ]);
        const universidades = await univRes.json();
        const comunas = await comRes.json();
        setOpciones({ universidades, comunas });
      } catch (e) {
        console.error("Error cargando opciones:", e);
      }
    };
    fetchOpciones();
  }, []);

  useEffect(() => {
    const getPsicologos = async () => {
      setLoading(true);
      try {
        const resp = await fetch(`http://localhost:5000/api/psychologists?page=1&limit=20&search=${debouncedBusqueda}`);
        const data = await resp.json();
        if (data.success) {
          setPsicologos(data.data || []);
        } else {
          setPsicologos([]);
        }
      } catch {
        setPsicologos([]);
      }
      setLoading(false);
    };
    getPsicologos();
  }, [debouncedBusqueda]);

  const handleFiltro = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const psicologosFiltrados = psicologos.filter((p) =>
    (!filtros.universidad || p.universidad === filtros.universidad) &&
    (!filtros.ciudad || p.ciudad === filtros.ciudad) &&
    (!filtros.comuna || p.comuna === filtros.comuna)
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8 pt-24">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl p-8 flex flex-col md:flex-row">
          
          {/* Filtros */}
          <div className="w-full md:w-1/4 pr-0 md:pr-8 mb-8 md:mb-0">
            <h3 className="text-2xl font-bold text-blue-800 mb-6">Filtros</h3>

            <input
              type="text"
              placeholder="Buscar por nombre"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full p-2 mb-4 border border-blue-200 rounded-lg"
            />

            <label className="block mb-1 font-semibold text-gray-700">Universidad</label>
            <select name="universidad" value={filtros.universidad} onChange={handleFiltro} className="w-full p-2 mb-4 border border-blue-200 rounded-lg">
              <option value="">Todas</option>
              {opciones.universidades.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>

            <label className="block mb-1 font-semibold text-gray-700">Comuna</label>
            <select name="comuna" value={filtros.comuna} onChange={handleFiltro} className="w-full p-2 mb-4 border border-blue-200 rounded-lg">
              <option value="">Todas</option>
              {opciones.comunas.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Lista de psicólogos */}
          <div className="w-full md:w-3/4">
            <h2 className="text-3xl font-extrabold text-blue-800 mb-6 text-center md:text-left">Psicólogos Disponibles</h2>

            {loading ? (
              <div className="text-center text-gray-500">Cargando psicólogos...</div>
            ) : psicologosFiltrados.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No se encontraron psicólogos.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {psicologosFiltrados.map((p) => (
                  <div key={p.usuario_id} className="bg-blue-50 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer border border-blue-100">
                    <div className="flex items-center mb-4">
                      <img src={p.foto_url || 'https://via.placeholder.com/100'} alt="Perfil" className="w-20 h-20 rounded-full object-cover border-4 border-blue-300 shadow-md" />
                      <div className="ml-4">
                        <h3 className="text-xl font-bold text-blue-700">{p.nombre} {p.apellido}</h3>
                        <p className="text-blue-500 text-sm">{p.especialidad || 'Psicólogo(a)'}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-2"><span className="font-semibold">Universidad:</span> {p.universidad || 'No especificada'}</p>
                    <p className="text-gray-600 text-sm mb-2"><span className="font-semibold">Ubicación:</span> {p.ciudad}, {p.comuna}</p>
                    <p className="text-gray-600 text-sm mb-3">{p.descripcion || 'Especialista en salud mental.'}</p>
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/psychologist/${p.usuario_id}`)} className="flex-1 bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700">Ver Perfil</button>
                      <button onClick={() => navigate(`/reservar/${p.usuario_id}`)} className="flex-1 bg-white border border-blue-600 text-blue-600 py-2 rounded-xl hover:bg-blue-50">Reservar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
