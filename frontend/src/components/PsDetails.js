import React from "react";
import { useParams, useNavigate } from "react-router-dom";

// Demo de psicólogos
const psicologosDemo = [
  {
    id: 1,
    nombre: "Ana",
    apellido: "García",
    edad: 35,
    ciudad: "Santiago",
    universidad: "U. de Chile",
    descripcion: "Especialista en adolescentes. Más de 10 años de experiencia.",
    foto: "",
  },
  {
    id: 2,
    nombre: "Carlos",
    apellido: "Ruiz",
    edad: 41,
    ciudad: "Viña del Mar",
    universidad: "PUC",
    descripcion: "Atención en terapia familiar y de pareja.",
    foto: "",
  },
  {
    id: 3,
    nombre: "Marta",
    apellido: "Pérez",
    edad: 29,
    ciudad: "Concepción",
    universidad: "UAI",
    descripcion: "Terapia cognitivo-conductual. Experiencia en ansiedad y estrés.",
    foto: "",
  },
  {
    id: 4,
    nombre: "Julio",
    apellido: "Navarro",
    edad: 50,
    ciudad: "La Serena",
    universidad: "UDP",
    descripcion: "Psicólogo clínico, especialista en adultos mayores.",
    foto: "",
  },
];

export default function PsDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const psicologo = psicologosDemo.find(p => p.id === parseInt(id));

  if (!psicologo) return <div className="text-center mt-5">Psicólogo no encontrado</div>;

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Navbar igual que en Search */}
      <nav className="navbar navbar-expand-lg custom-navbar shadow-sm px-4">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="Logo" style={{ width: 44, height: 44, marginRight: 10 }} />
            <span className="navbar-brand mb-0 h1 fs-4 fw-bold text-light">WebPsicologos</span>
          </div>
          <div className="d-flex align-items-center">
            <div
              className="bg-secondary rounded-circle d-flex align-items-center justify-content-center me-3"
              style={{ width: 42, height: 42, cursor: "pointer" }}
              title="Cuenta"
              onClick={() => navigate("/profile")}
            >
              <i className="bi bi-person fs-3 text-white" />
            </div>
            <button
              className="btn btn-link text-white fs-4 p-0"
              style={{ marginLeft: 10 }}
              title="Cerrar sesión"
              onClick={() => navigate("/")}
            >
              <i className="bi bi-box-arrow-right"></i>
            </button>
          </div>
        </div>
      </nav>
      
      {/* Detalle del psicólogo */}
      <div className="d-flex flex-column align-items-center flex-grow-1">
        <div className="border rounded-4 shadow p-5 my-5 bg-white" style={{ maxWidth: 520, width: "100%" }}>
          <div className="d-flex flex-column align-items-center">
            <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center mb-3"
                 style={{ width: 80, height: 80 }}>
              {psicologo.foto
                ? <img src={psicologo.foto} alt="perfil" className="rounded-circle" style={{ width: 78, height: 78, objectFit: "cover" }} />
                : <i className="bi bi-person fs-1 text-white" />}
            </div>
            <h2 className="mb-1">{psicologo.nombre} {psicologo.apellido}</h2>
            <div className="text-secondary mb-2">Edad: {psicologo.edad}</div>
            <div className="mb-2"><b>Ciudad:</b> {psicologo.ciudad}</div>
            <div className="mb-2"><b>Universidad:</b> {psicologo.universidad}</div>
            <div className="mb-4"><b>Sobre mí:</b> {psicologo.descripcion}</div>
            <button className="btn btn-success mb-3">Ver disponibilidad de hrs</button>
            <button className="btn btn-secondary" onClick={() => navigate("/search")}>
              ← Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
