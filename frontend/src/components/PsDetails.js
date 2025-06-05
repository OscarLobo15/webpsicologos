import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function PsDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [psicologo, setPsicologo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Traer info real del backend
    const getPsicologo = async () => {
      setLoading(true);
      try {
        const resp = await fetch(`http://localhost:5000/api/psychologists/${id}`);
        const data = await resp.json();
        if (data.success) {
          setPsicologo(data.psicologo);
        } else {
          setPsicologo(null);
        }
      } catch {
        setPsicologo(null);
      }
      setLoading(false);
    };
    getPsicologo();
  }, [id]);

  if (loading) return <div className="text-center mt-5">Cargando psicólogo...</div>;
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
              {psicologo.foto_url
                ? <img src={psicologo.foto_url} alt="perfil" className="rounded-circle" style={{ width: 78, height: 78, objectFit: "cover" }} />
                : <i className="bi bi-person fs-1 text-white" />}
            </div>
            <h2 className="mb-1">{psicologo.nombre} {psicologo.apellido}</h2>
            {psicologo.edad && (
              <div className="text-secondary mb-2">Edad: {psicologo.edad}</div>
            )}
            <div className="mb-2"><b>Ciudad:</b> {psicologo.ciudad}</div>
            <div className="mb-2"><b>Comuna:</b> {psicologo.comuna}</div>
            <div className="mb-2"><b>Universidad:</b> {psicologo.universidad}</div>
            <div className="mb-2"><b>Título:</b> {psicologo.titulo}</div>
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
