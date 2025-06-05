import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Utilidad para extraer valores únicos
function uniqueValues(array, key) {
  return [...new Set(array.map(obj => obj[key]).filter(Boolean))];
}

export default function Search() {
  const navigate = useNavigate();

  // Chequear sesión
  const isLogged = !!localStorage.getItem("token");
  let usuarioInfo = null;
  if (isLogged) {
    try {
      usuarioInfo = JSON.parse(localStorage.getItem("user"));
    } catch {
      usuarioInfo = null;
    }
  }

  // Estado de psicólogos
  const [psicologos, setPsicologos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros seleccionados
  const [filtros, setFiltros] = useState({
    universidad: "",
    ciudad: "",
    comuna: "",
  });

  // Opciones para los selects
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
          setPsicologos([]);
          setOpciones({ universidades: [], ciudades: [], comunas: [] });
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

  // Filtra según selects
  const psicologosFiltrados = psicologos.filter((p) =>
    (!filtros.universidad || p.universidad === filtros.universidad) &&
    (!filtros.ciudad || p.ciudad === filtros.ciudad) &&
    (!filtros.comuna || p.comuna === filtros.comuna)
  );

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* NAVBAR */}
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
            {isLogged ? (
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
                  style={{ marginLeft: 10 }}
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
            ) : (
              <>
                <button
                  className="btn btn-outline-light me-2"
                  onClick={() => navigate("/login")}
                >
                  Iniciar sesión
                </button>
                <button
                  className="btn btn-light"
                  onClick={() => navigate("/register")}
                >
                  Crear cuenta
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* FILTROS */}
      <div className="container my-4">
        <div className="row g-2 align-items-end">
          <div className="col-md-4">
            <label className="form-label mb-1">Universidad</label>
            <select
              className="form-select"
              name="universidad"
              value={filtros.universidad}
              onChange={handleFiltro}
            >
              <option value="">Todas</option>
              {opciones.universidades.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label mb-1">Ciudad</label>
            <select
              className="form-select"
              name="ciudad"
              value={filtros.ciudad}
              onChange={handleFiltro}
            >
              <option value="">Todas</option>
              {opciones.ciudades.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label mb-1">Comuna</label>
            <select
              className="form-select"
              name="comuna"
              value={filtros.comuna}
              onChange={handleFiltro}
            >
              <option value="">Todas</option>
              {opciones.comunas.map((com) => (
                <option key={com} value={com}>
                  {com}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* CARDS DE PSICÓLOGOS */}
      <div className="container flex-grow-1 mb-5">
        {loading ? (
          <div className="text-center py-5">Cargando psicólogos...</div>
        ) : psicologosFiltrados.length === 0 ? (
          <div className="text-center py-5 fs-4 text-secondary">
            No hay psicólogos disponibles.
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-3 g-4">
            {psicologosFiltrados.map((p) => (
              <div
                key={p.usuario_id || p.id}
                className="col"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/psychologist/${p.usuario_id || p.id}`)}
              >
                <div className="card h-100 shadow-sm border-0 text-center p-3">
                  <div className="d-flex flex-column align-items-center mb-2">
                    <div
                      className="bg-secondary rounded-circle d-flex align-items-center justify-content-center mb-2"
                      style={{ width: 80, height: 80 }}
                    >
                      {p.foto_url ? (
                        <img
                          src={p.foto_url}
                          alt="perfil"
                          className="rounded-circle"
                          style={{
                            width: 78,
                            height: 78,
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <i className="bi bi-person fs-1 text-white" />
                      )}
                    </div>
                    <div className="fw-bold fs-5">
                      {p.nombre} {p.apellido}
                    </div>
                    {p.edad && (
                      <div className="text-secondary">Edad: {p.edad}</div>
                    )}
                    {p.ciudad && (
                      <div className="text-secondary">{p.ciudad}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
