import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  // Checa sesión y saca token/usuario
  let usuario = null;
  try {
    usuario = JSON.parse(localStorage.getItem("user"));
  } catch {
    usuario = null;
  }

  useEffect(() => {
    if (!usuario || !localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    const fetchPerfil = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          // Combina el perfil con el email guardado en usuario
          setPerfil({
            ...data.perfil,
            email: usuario.email, // <-- Así agregas el correo
          });
        }
      } catch {
        // Puedes mostrar error si quieres
      }
      setLoading(false);
    };

    fetchPerfil();
  }, [navigate, usuario]);

  if (!usuario) return null;

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
              {perfil && perfil.foto_url
                ? <img src={perfil.foto_url} alt="perfil" className="rounded-circle" style={{ width: 40, height: 40, objectFit: "cover" }} />
                : <i className="bi bi-person fs-3 text-white" />}
            </div>
            <button
              className="btn btn-link text-white fs-4 p-0"
              style={{ marginLeft: 10 }}
              title="Cerrar sesión"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
              }}
            >
              <i className="bi bi-box-arrow-right"></i>
            </button>
          </div>
        </div>
      </nav>
      
      {/* Perfil usuario */}
      <div className="d-flex flex-column align-items-center flex-grow-1">
        <div className="border rounded-4 shadow p-5 my-5 bg-white" style={{ maxWidth: 520, width: "100%" }}>
          {!loading && perfil ? (
            <div className="d-flex flex-column align-items-center">
              <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center mb-3"
                   style={{ width: 80, height: 80 }}>
                {perfil.foto_url
                  ? <img src={perfil.foto_url} alt="perfil" className="rounded-circle" style={{ width: 78, height: 78, objectFit: "cover" }} />
                  : <i className="bi bi-person fs-1 text-white" />}
              </div>
              <h2 className="mb-1">{perfil.nombre} {perfil.apellido}</h2>
              {/* Aquí siempre mostrarás el correo, ya que lo tienes en perfil.email */}
              <div className="text-secondary mb-3">{perfil.email}</div>
              {perfil.ciudad && (
                <div className="mb-2"><b>Ciudad:</b> {perfil.ciudad}</div>
              )}
              {perfil.universidad && (
                <div className="mb-2"><b>Universidad:</b> {perfil.universidad}</div>
              )}
              {perfil.descripcion && (
                <div className="mb-4"><b>Sobre mí:</b> {perfil.descripcion}</div>
              )}
              <button className="btn btn-outline-primary mb-3" onClick={() => navigate("/update")}>
                Actualizar información
              </button>
              <button className="btn btn-secondary" onClick={() => navigate("/search")}>
                ← Volver
              </button>
            </div>
          ) : (
            <div className="text-center">Cargando perfil...</div>
          )}
        </div>
      </div>
    </div>
  );
}
