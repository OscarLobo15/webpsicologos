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
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
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
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="border rounded-3xl shadow-lg p-8 bg-white max-w-md w-full">
        <h2 className="text-center text-blue-700 text-3xl font-bold mb-6">Iniciar sesión</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Correo electrónico</label>
            <input
              type="email"
              className="w-full p-3 border border-blue-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              name="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              autoFocus
            />
            {(submitted || touched.email) && isFieldEmpty("email") && (
              <div className="text-red-600 mt-1 text-sm">Este campo es obligatorio</div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Contraseña</label>
            <input
              type="password"
              className="w-full p-3 border border-blue-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              name="password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {(submitted || touched.password) && isFieldEmpty("password") && (
              <div className="text-red-600 mt-1 text-sm">Este campo es obligatorio</div>
            )}
          </div>

          {loginError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
              {loginError}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg shadow hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="text-center mt-4">
          <span className="text-gray-600">¿No tienes cuenta?</span>{" "}
          <button
            onClick={() => navigate('/register')}
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            Regístrate
          </button>
        </div>
      </div>
    </div>
  );
}