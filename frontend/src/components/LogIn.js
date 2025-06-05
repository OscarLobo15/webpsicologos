import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isFieldEmpty = (field) => !form[field];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const isFormValid = form.email && form.password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setLoginError("");
    if (!isFormValid) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (data.success) {
        // Guarda el token y el usuario en localStorage (o donde prefieras)
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        // Redirige según tipo de usuario (ajusta rutas si quieres)
        if (data.user.tipo_usuario === "psicologo") {
          navigate("/dashboard-psicologo");
        } else {
          navigate("/search");
        }
      } else {
        setLoginError(data.error || "Correo o contraseña incorrectos");
      }
    } catch (err) {
      setLoginError("Error de conexión con el servidor.");
    }
    setLoading(false);
  };

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
      <div className="border rounded-4 shadow p-5 bg-white" style={{ maxWidth: 400, width: "100%" }}>
        <h2 className="text-center text-primary mb-4">Iniciar sesión</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label">Correo electrónico</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              autoFocus
            />
            {(submitted || touched.email) && isFieldEmpty("email") && (
              <div className="text-danger mt-1" style={{ fontSize: "0.9em" }}>
                Este campo es obligatorio
              </div>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {(submitted || touched.password) && isFieldEmpty("password") && (
              <div className="text-danger mt-1" style={{ fontSize: "0.9em" }}>
                Este campo es obligatorio
              </div>
            )}
          </div>
          {loginError && (
            <div className="alert alert-danger py-2" style={{ fontSize: "0.96em" }}>
              {loginError}
            </div>
          )}
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
        <div className="text-center mt-3">
          <span className="text-secondary">¿No tienes cuenta?</span>{" "}
          <a href="/register" className="btn btn-link p-0 align-baseline">Regístrate</a>
        </div>
      </div>
    </div>
  );
}
