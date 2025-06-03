import React, { useState } from "react";




// Mocks para pruebas (psicólogos)
const psicologosDemo = [
  {
    id: 1,
    nombre: "Ana",
    apellido: "García",
    edad: 35,
    ciudad: "Santiago",
    foto: "", // No hay foto real, se usará círculo
  },
  {
    id: 2,
    nombre: "Carlos",
    apellido: "Ruiz",
    edad: 41,
    ciudad: "Viña del Mar",
    foto: "",
  },
  {
    id: 3,
    nombre: "Marta",
    apellido: "Pérez",
    edad: 29,
    ciudad: "Concepción",
    foto: "",
  },
  {
    id: 4,
    nombre: "Julio",
    apellido: "Navarro",
    edad: 50,
    ciudad: "La Serena",
    foto: "",
  },
];

const usuarioMock = {
  nombre: "Usuario",
  foto: "", // "" para que salga solo el círculo gris
};

export default function Search() {
  // Para los tooltips de Bootstrap
  React.useEffect(() => {
    // Bootstrap 5 Tooltip init
    // eslint-disable-next-line
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    // eslint-disable-next-line
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new window.bootstrap.Tooltip(tooltipTriggerEl);
    });
  }, []);

  // Filtros (simple, puedes expandirlo)
  const [filtros, setFiltros] = useState({
    sexo: "",
    universidad: "",
    ciudad: "",
    comuna: "",
  });

  const handleFiltro = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  // Filtros demo (puedes poblarlos desde backend o datos reales)
  const universidades = ["U. de Chile", "PUC", "UAI", "UDP"];
  const ciudades = ["Santiago", "Viña del Mar", "Concepción", "La Serena"];
  const comunas = ["Providencia", "Las Condes", "Ñuñoa", "Viña Centro"];

  // Simula filtrar (por ahora muestra todos)
  const psicologosFiltrados = psicologosDemo; // Aquí agregarías lógica de filtrado real

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg custom-navbar shadow-sm px-4">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          {/* Izquierda: Logo y nombre */}
          <div className="d-flex align-items-center">
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="Logo" style={{ width: 44, height: 44, marginRight: 10 }} />
            <span className="navbar-brand mb-0 h1 fs-4 fw-bold text-light">WebPsicologos</span>
          </div>
          {/* Derecha: Foto usuario y botón logout */}
          <div className="d-flex align-items-center">
            {/* Foto circular */}
            <div
              className="bg-secondary rounded-circle d-flex align-items-center justify-content-center me-3"
              style={{ width: 42, height: 42, cursor: "pointer" }}
              data-bs-toggle="tooltip"
              data-bs-placement="bottom"
              title="Cuenta"
            >
              {usuarioMock.foto
                ? <img src={usuarioMock.foto} alt="perfil" className="rounded-circle" style={{ width: 40, height: 40, objectFit: "cover" }} />
                : <i className="bi bi-person fs-3 text-white" />}
            </div>
            {/* Botón logout */}
            <button
              className="btn btn-link text-white fs-4 p-0"
              style={{ marginLeft: 10 }}
              data-bs-toggle="tooltip"
              data-bs-placement="bottom"
              title="Cerrar sesión"
              onClick={() => {
                // Lógica para cerrar sesión aquí
                window.location.href = "/login";
              }}
            >
              <i className="bi bi-box-arrow-right"></i>
            </button>
          </div>
        </div>
      </nav>

      {/* FILTROS */}
      <div className="container my-4">
        <div className="row g-2 align-items-end">
          <div className="col-md-2">
            <label className="form-label mb-1">Sexo</label>
            <select className="form-select" name="sexo" value={filtros.sexo} onChange={handleFiltro}>
              <option value="">Todos</option>
              <option value="Femenino">Femenino</option>
              <option value="Masculino">Masculino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label mb-1">Universidad</label>
            <select className="form-select" name="universidad" value={filtros.universidad} onChange={handleFiltro}>
              <option value="">Todas</option>
              {universidades.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label mb-1">Ciudad</label>
            <select className="form-select" name="ciudad" value={filtros.ciudad} onChange={handleFiltro}>
              <option value="">Todas</option>
              {ciudades.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label mb-1">Comuna</label>
            <select className="form-select" name="comuna" value={filtros.comuna} onChange={handleFiltro}>
              <option value="">Todas</option>
              {comunas.map(com => (
                <option key={com} value={com}>{com}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* CARDS DE PSICÓLOGOS */}
      <div className="container flex-grow-1 mb-5">
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {psicologosFiltrados.map((p) => (
            <div key={p.id} className="col">
              <div className="card h-100 shadow-sm border-0 text-center p-3">
                <div className="d-flex flex-column align-items-center mb-2">
                  {/* Foto circular fake */}
                  <div
                    className="bg-secondary rounded-circle d-flex align-items-center justify-content-center mb-2"
                    style={{ width: 80, height: 80 }}
                  >
                    {p.foto
                      ? <img src={p.foto} alt="perfil" className="rounded-circle" style={{ width: 78, height: 78, objectFit: "cover" }} />
                      : <i className="bi bi-person fs-1 text-white" />}
                  </div>
                  <div className="fw-bold fs-5">{p.nombre} {p.apellido}</div>
                  <div className="text-secondary">Edad: {p.edad}</div>
                  <div className="text-secondary">{p.ciudad}</div>
                </div>
                {/* Más info */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
