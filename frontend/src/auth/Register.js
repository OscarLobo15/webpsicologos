import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { subirFotoPerfil } from "../api/subirFotoPerfil";

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
      fotoUrl = await subirFotoPerfil(fotoFile, form.correo || Date.now());
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
          titulo: form.titulo,
          descripcion: form.descripcion,
          foto_path: fotoUrl,
          ciudad: form.ciudad,
          comuna: form.comuna
        })
      });

      const result = await response.json();
      if (!result.success) {
        setMensaje(result.error);
        return;
      }

      navigate("/dashboard-psicologo");
    } catch {
      setMensaje("Error en el registro.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Registro Psicólogo</h2>
      <input placeholder="Nombre" onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="mb-3 w-full border p-2" />
      <input placeholder="Apellido" onChange={(e) => setForm({ ...form, apellido: e.target.value })} className="mb-3 w-full border p-2" />
      <input placeholder="Correo" type="email" onChange={(e) => setForm({ ...form, correo: e.target.value })} className="mb-3 w-full border p-2" />
      <input placeholder="Contraseña" type="password" onChange={(e) => setForm({ ...form, password: e.target.value })} className="mb-3 w-full border p-2" />
      <input placeholder="Título" onChange={(e) => setForm({ ...form, titulo: e.target.value })} className="mb-3 w-full border p-2" />
      <label className="block mb-2">Foto de perfil</label>
      <input type="file" accept="image/*" onChange={e => setFotoFile(e.target.files[0])} className="mb-3 w-full border p-2" />
      <textarea placeholder="Descripción" onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="mb-3 w-full border p-2" />

      <select onChange={(e) => setForm({ ...form, universidad: e.target.value })} className="mb-3 w-full border p-2">
        <option value="">Selecciona universidad</option>
        {universidades.map((u, i) => <option key={i} value={u}>{u}</option>)}
      </select>

      <select onChange={(e) => setForm({ ...form, ciudad: e.target.value, comuna: "" })} className="mb-3 w-full border p-2">
        <option value="">Selecciona ciudad</option>
        {ciudades.map((c, i) => <option key={i} value={c}>{c}</option>)}
      </select>

      <select onChange={(e) => setForm({ ...form, comuna: e.target.value })} className="mb-3 w-full border p-2" disabled={!form.ciudad}>
        <option value="">Selecciona comuna</option>
        {comunasFiltradas.map((c, i) => <option key={i} value={c}>{c}</option>)}
      </select>

      <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded">Registrarse</button>
      {mensaje && <p className="mt-4 text-red-500">{mensaje}</p>}
    </form>
  );
}