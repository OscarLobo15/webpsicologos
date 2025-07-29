import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UpdateData() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  let usuario = null;
  try { usuario = JSON.parse(localStorage.getItem("user")); } catch { usuario = null; }

  useEffect(() => {
    if (!usuario || !localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    const fetchPerfil = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await response.json();
        if (data.success) {
          setPerfil({ ...data.perfil, email: usuario.email });
          setForm({ ...data.perfil });
        }
      } catch {}
      setLoading(false);
    };
    fetchPerfil();
  }, [navigate, usuario]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMensaje("");
    try {
      const response = await fetch("http://localhost:5000/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (data.success) {
        setMensaje("Perfil actualizado correctamente.");
        setTimeout(() => navigate("/profile"), 1200); // Redirige después de guardar
      } else {
        setMensaje(data.error || "Error al actualizar perfil");
      }
    } catch {
      setMensaje("Error de conexión.");
    }
  };

  if (!usuario) return null;

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Navbar igual que antes */}
      <nav className="navbar navbar-expand-lg custom-navbar shadow-sm px-4">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="Logo" style={{ width: 44, height: 44, marginRight: 10 }} />
            <span className="navbar-brand mb-0 h1 fs-4 fw-bold text-light">WebPsicologos</span>
          </div>
        </div>
      </nav>

      <div className="d-flex flex-column align-items-center flex-grow-1">
        <div className="border rounded-4 shadow p-5 my-5 bg-white" style={{ maxWidth: 520, width: "100%" }}>
          {!loading && perfil ? (
            <form className="d-flex flex-column align-items-center" style={{ width: "100%" }} onSubmit={handleSave}>
              <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center mb-3"
                   style={{ width: 80, height: 80 }}>
                {form.foto_url
                  ? <img src={form.foto_url} alt="perfil" className="rounded-circle" style={{ width: 78, height: 78, objectFit: "cover" }} />
                  : <i className="bi bi-person fs-1 text-white" />}
              </div>
              <div className="mb-2 w-100">
                <label>Nombre</label>
                <input type="text" className="form-control" name="nombre" value={form.nombre || ""} onChange={handleChange} required />
              </div>
              <div className="mb-2 w-100">
                <label>Apellido</label>
                <input type="text" className="form-control" name="apellido" value={form.apellido || ""} onChange={handleChange} required />
              </div>
              {/* Campos solo para psicólogos */}
              {perfil.universidad !== undefined && (
                <div className="mb-2 w-100">
                  <label>Universidad</label>
                  <input type="text" className="form-control" name="universidad" value={form.universidad || ""} onChange={handleChange} />
                </div>
              )}
              {perfil.titulo !== undefined && (
                <div className="mb-2 w-100">
                  <label>Título</label>
                  <input type="text" className="form-control" name="titulo" value={form.titulo || ""} onChange={handleChange} />
                </div>
              )}
              <div className="mb-2 w-100">
                <label>Foto URL</label>
                <input type="text" className="form-control" name="foto_url" value={form.foto_url || ""} onChange={handleChange} />
              </div>
              {perfil.descripcion !== undefined && (
                <div className="mb-2 w-100">
                  <label>Sobre mí</label>
                  <textarea className="form-control" name="descripcion" rows={2} value={form.descripcion || ""} onChange={handleChange} />
                </div>
              )}
              <button className="btn btn-primary mt-3 w-100" type="submit">Guardar cambios</button>
              <button className="btn btn-secondary mt-2 w-100" type="button" onClick={() => navigate("/profile")}>
                Cancelar
              </button>
              {mensaje && <div className="alert alert-info mt-3 w-100">{mensaje}</div>}
            </form>
          ) : (
            <div className="text-center">Cargando perfil...</div>
          )}
        </div>
      </div>
    </div>
  );
}
