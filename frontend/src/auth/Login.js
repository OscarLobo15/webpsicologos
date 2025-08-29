import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validación previa simple
    if (!form.email || !form.password) {
      setError("Debes ingresar correo y contraseña.");
      setLoading(false);
      return;
    }

    // 1. Login con Supabase Auth
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (authError) {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    // 2. Pedir token propio al backend
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email })
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "No se pudo obtener el token de sesión.");
        setLoading(false);
        return;
      }
      // Guardar token y usuario
      localStorage.setItem("token", json.token);
      localStorage.setItem("user", JSON.stringify(json.user));
      // Redirección según tipo de usuario
      if (json.user.tipo_usuario === "psicologo") {
        navigate("/dashboard-psicologo");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="border rounded-3xl shadow-lg p-8 bg-white max-w-md w-full">
        <h2 className="text-center text-blue-700 text-3xl font-bold mb-6">Iniciar sesión</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Correo"
            value={form.email}
            onChange={handleChange}
            className="w-full mb-4 p-3 border rounded"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            className="w-full mb-4 p-3 border rounded"
            required
          />
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded"
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
