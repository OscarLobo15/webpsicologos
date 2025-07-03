import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function uniqueValues(array, key) {
  return [...new Set(array.map(obj => obj[key]).filter(Boolean))];
}

export default function Search() {
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

  const [psicologos, setPsicologos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filtros, setFiltros] = useState({
    universidad: "",
    ciudad: "",
    comuna: "",
  });

  const [opciones, setOpciones] = useState({
    universidades: [],
    ciudades: [],
    comunas: [],
  });

  useEffect(() => {
    const getPsicologos = async () => {
      setLoading(true);
      try {
        const resp = await fetch("http://localhost:5000/api/psychologists");
        const data = await resp.json();
        if (data.success) {
          setPsicologos(data.psicologos || []);
          setOpciones({
            universidades: uniqueValues(data.psicologos, "universidad"),
            ciudades: uniqueValues(data.psicologos, "ciudad"),
            comunas: uniqueValues(data.psicologos, "comuna"),
          });
        } else {
          setOpciones({ universidades: [], ciudades: [], comunas: [] });
          setPsicologos([]);
        }
      } catch {
        setPsicologos([]);
        setOpciones({ universidades: [], ciudades: [], comunas: [] });
      }
      setLoading(false);
    };
    getPsicologos();
  }, []);

  const handleFiltro = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const psicologosFiltrados = psicologos.filter((p) =>
    (!filtros.universidad || p.universidad === filtros.universidad) &&
    (!filtros.ciudad || p.ciudad === filtros.ciudad) &&
    (!filtros.comuna || p.comuna === filtros.comuna)
  );

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg custom-navbar px-4 shadow-sm">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg"
              alt="Logo"
              style={{ width: 40, height: 40, marginRight: 10 }}
            />
            <span className="navbar-brand mb-0 h1 fs-4 fw-bold text-light">WebPsicologos</span>
          </div>
          <div className="ms-auto d-flex align-items-center gap-2">
            <button className="text-white text-decoration-none btn btn-link p-0 small" onClick={() => navigate("/login")}>Iniciar sesión</button>
            <button className="btn btn-outline-light btn-sm" onClick={() => navigate("/psychologists-landing")}>¿Eres psicólogo?</button>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <div className="container py-5 flex-grow-1">
        <h2 className="text-center mb-4">Encuentra a tu psicólogo ideal</h2>
        <div className="row">
          {/* Filtros laterales */}
          <div className="col-md-3 mb-4">
            <div className="border rounded p-3 bg-white shadow-sm">
              <h5 className="mb-3">Filtros</h5>

              <label className="form-label">Universidad</label>
              <select className="form-select mb-3" name="universidad" value={filtros.universidad} onChange={handleFiltro}>
                <option value="">Todas</option>
                {opciones.universidades.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>

              <label className="form-label">Ciudad</label>
              <select className="form-select mb-3" name="ciudad" value={filtros.ciudad} onChange={handleFiltro}>
                <option value="">Todas</option>
                {opciones.ciudades.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>

              <label className="form-label">Comuna</label>
              <select className="form-select mb-3" name="comuna" value={filtros.comuna} onChange={handleFiltro}>
                <option value="">Todas</option>
                {opciones.comunas.map((com) => <option key={com} value={com}>{com}</option>)}
              </select>
            </div>
          </div>

          {/* Lista de psicólogos */}
          <div className="col-md-9">
            {loading ? (
              <div className="text-center">Cargando psicólogos...</div>
            ) : psicologosFiltrados.length === 0 ? (
              <div className="text-center text-muted">No hay psicólogos disponibles</div>
            ) : (
              psicologosFiltrados.map((p) => (
                <div key={p.usuario_id} className="card mb-3 shadow-sm">
                  <div className="row g-0 align-items-center">
                    <div className="col-md-3 d-flex justify-content-center py-3">
                      <img
                        src={p.foto_url || 'https://via.placeholder.com/100'}
                        alt="perfil"
                        className="rounded-circle"
                        style={{ width: 80, height: 80, objectFit: 'cover' }}
                      />
                    </div>
                    <div className="col-md-6">
                      <div className="card-body">
                        <h5 className="card-title mb-1">{p.nombre} {p.apellido}</h5>
                        <p className="card-text mb-1"><small className="text-muted">{p.especialidad || 'Psicólogo(a)'}</small></p>
                        <p className="card-text mb-1">{p.descripcion || 'Ansiedad, Depresión, Estrés'}</p>
                        <p className="card-text"><small className="text-muted">{p.ciudad}</small></p>
                      </div>
                    </div>
                    <div className="col-md-3 text-center d-flex flex-column justify-content-center p-3">
                      <button onClick={() => navigate(`/psychologist/${p.usuario_id}`)} className="btn btn-outline-primary mb-2 w-100">Ver perfil</button>
                      <button onClick={() => navigate(`/reservar/${p.usuario_id}`)} className="btn btn-outline-primary mb-2 w-100">Reservar sesión</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
