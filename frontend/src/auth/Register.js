import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { subirFoto } from "../api/subirFotoPerfil";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const [fotoFile, setFotoFile] = useState(null);
  const [universidades, setUniversidades] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [comunasRaw, setComunasRaw] = useState([]);
  const [comunasFiltradas, setComunasFiltradas] = useState([]);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const resUni = await fetch("http://localhost:5000/api/location/universidades");
        const resCom = await fetch("http://localhost:5000/api/location/comunas");
        const universidades = await resUni.json();
        const comunas = await resCom.json();
        setUniversidades(universidades);
        setCiudades([...new Set(comunas.map(c => c.ciudad))]);
        setComunasRaw(comunas);
      } catch (err) {
        console.error("Error cargando opciones:", err);
      }
    };
    fetchDatos();
  }, []);

  useEffect(() => {
    if (form.ciudad) {
      const filtradas = comunasRaw
        .filter(c => c.ciudad === form.ciudad)
        .map(c => c.comuna);
      setComunasFiltradas(filtradas);
    } else {
      setComunasFiltradas([]);
    }
  }, [form.ciudad, comunasRaw]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    let fotoUrl = "";
    if (fotoFile) {
      setMensaje("Subiendo foto...");
      const token = localStorage.getItem("token"); // Esto podría ser null durante el registro
      const result = await subirFoto(fotoFile, token || form.correo || Date.now());
      fotoUrl = result.url || "";
      if (!fotoUrl) {
        setMensaje("No se pudo subir la foto de perfil.");
        return;
      }
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.correo,
          password: form.password,
          tipo_usuario: "psicologo",
          nombre: form.nombre,
          apellido: form.apellido,
          universidad: form.universidad,
          ciudad: form.ciudad,
          comuna: form.comuna
        })
      });

      const result = await response.json();
      if (!result.success) {
        setMensaje(result.error);
        return;
      }

      if (result.success && result.token) {
        // Guardar token y user en localStorage para mantener sesión iniciada
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));

        // Actualizar user_metadata en Supabase Auth
        await supabase.auth.updateUser({
          data: {
            nombre: form.nombre,
            apellido: form.apellido,
            full_name: form.nombre + " " + form.apellido
          }
        });

        navigate("/crear-perfil");
        return;
      }

      navigate("/dashboard-psicologo");
    } catch {
      setMensaje("Error en el registro.");
    }
  };

  // Función para capitalizar el primer carácter
  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-10">
        <h2 className="text-3xl font-extrabold text-blue-800 mb-8 text-center">Crea tu cuenta</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-blue-700 font-semibold mb-1">Nombre</label>
            <input placeholder="Nombre" value={form.nombre || ""} onChange={(e) => setForm({ ...form, nombre: capitalize(e.target.value) })} className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          <div>
            <label className="block text-blue-700 font-semibold mb-1">Apellido</label>
            <input placeholder="Apellido" value={form.apellido || ""} onChange={(e) => setForm({ ...form, apellido: capitalize(e.target.value) })} className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          <div>
            <label className="block text-blue-700 font-semibold mb-1">Correo electrónico</label>
            <input placeholder="Correo" type="email" value={form.correo || ""} onChange={(e) => setForm({ ...form, correo: e.target.value })} className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          <div>
            <label className="block text-blue-700 font-semibold mb-1">Contraseña</label>
            <input placeholder="Contraseña" type="password" value={form.password || ""} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          <div>
            <label className="block text-blue-700 font-semibold mb-1">Universidad</label>
            <select value={form.universidad || ""} onChange={(e) => setForm({ ...form, universidad: capitalize(e.target.value) })} className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300">
              <option value="">Selecciona universidad</option>
              {universidades.map((u, i) => <option key={i} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-blue-700 font-semibold mb-1">Ciudad</label>
            <select value={form.ciudad || ""} onChange={(e) => setForm({ ...form, ciudad: capitalize(e.target.value), comuna: "" })} className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300">
              <option value="">Selecciona ciudad</option>
              {ciudades.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-blue-700 font-semibold mb-1">Comuna</label>
            <select value={form.comuna || ""} onChange={(e) => setForm({ ...form, comuna: capitalize(e.target.value) })} className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" disabled={!form.ciudad}>
              <option value="">Selecciona comuna</option>
              {comunasFiltradas.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors">Registrarme</button>
          {mensaje && <p className="mt-4 text-red-500 text-center font-semibold">{mensaje}</p>}
        </form>
      </div>
    </div>
  );
}