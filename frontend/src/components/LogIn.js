import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  const isFieldEmpty = (field) => !form[field];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const isFormValid = form.email && form.password;

  // Aquí simulas autenticación; en la práctica conectas con tu backend
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (!isFormValid) return;

    // Simulación de login: puedes cambiar la lógica
    if (form.email === "usuario@demo.com" && form.password === "demo123") {
      setLoginError("");
      navigate("/search");
    } else {
      setLoginError("Correo o contraseña incorrectos");
    }
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
          <button type="submit" className="btn btn-primary w-100">
            Iniciar sesión
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
