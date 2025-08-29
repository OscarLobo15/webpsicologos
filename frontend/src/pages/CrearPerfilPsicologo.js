import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const camposIniciales = {
  areas_atencion: [],
  enfoque_terapeutico: "",
  formacion_academica: [],
  experiencia: "",
  idiomas: [],
  tarifas: "",
  modalidad_atencion: "",
  descripcion: "",
  foto_path: ""
};

export default function CrearPerfilPsicologo() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(camposIniciales);
  const [areaInput, setAreaInput] = useState("");
  const [formacionInput, setFormacionInput] = useState("");
  const [idiomaInput, setIdiomaInput] = useState("");
  const [fotoFile, setFotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handlers para arrays
  const handleAddArea = () => {
    if (areaInput.trim()) {
      setPerfil({ ...perfil, areas_atencion: [...perfil.areas_atencion, areaInput.trim()] });
      setAreaInput("");
    }
  };
  const handleRemoveArea = idx => {
    setPerfil({ ...perfil, areas_atencion: perfil.areas_atencion.filter((_, i) => i !== idx) });
  };

  const handleAddFormacion = () => {
    if (formacionInput.trim()) {
      setPerfil({ ...perfil, formacion_academica: [...perfil.formacion_academica, formacionInput.trim()] });
      setFormacionInput("");
    }
  };
  const handleRemoveFormacion = idx => {
    setPerfil({ ...perfil, formacion_academica: perfil.formacion_academica.filter((_, i) => i !== idx) });
  };

  const handleAddIdioma = () => {
    if (idiomaInput.trim()) {
      setPerfil({ ...perfil, idiomas: [...perfil.idiomas, idiomaInput.trim()] });
      setIdiomaInput("");
    }
  };
  const handleRemoveIdioma = idx => {
    setPerfil({ ...perfil, idiomas: perfil.idiomas.filter((_, i) => i !== idx) });
  };

  // Handler general
  const capitalizeFirst = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  const handleChange = e => {
    const name = e.target.name;
    let value = e.target.value;
    // No capitalizar email, password, foto_path
    if (!["email", "correo", "password", "foto_path"].includes(name)) {
      value = capitalizeFirst(value);
    }
    setPerfil({ ...perfil, [name]: value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      // 1. Subir la foto si hay
  let fotoUrl = perfil.foto_path;
      if (fotoFile) {
        const formData = new FormData();
        formData.append("photo", fotoFile);
        const respFoto = await fetch("http://localhost:5000/api/profile/photo", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        const dataFoto = await respFoto.json();
        if (dataFoto.success && dataFoto.photoUrl) {
          fotoUrl = dataFoto.photoUrl;
        } else {
          setError("Error al subir la foto de perfil");
          setLoading(false);
          return;
        }
      }
      // 2. Actualizar el perfil
      const resp = await fetch("http://localhost:5000/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
  body: JSON.stringify({ ...perfil, foto_path: fotoUrl }),
      });
      const data = await resp.json();
      if (data.success) {
        navigate("/dashboard-psicologo");
      } else {
        setError(data.message || "Error al actualizar el perfil");
      }
    } catch (err) {
      setError("Error al actualizar el perfil");
    }
    setLoading(false);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8 pt-36">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-8">
          <h1 className="text-2xl font-bold text-blue-800 mb-6">Completa tu perfil profesional</h1>
          <form onSubmit={handleSubmit}>
            
            {/* Foto */}
            <div className="mt-6">
              <label className="block text-blue-700 font-semibold mb-1">Foto de perfil</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setFotoFile(e.target.files[0])}
                className="mb-2"
              />
            </div>

            {/* Descripción */}
            <div className="mt-6">
              <label className="block text-blue-700 font-semibold mb-1">Descripción profesional</label>
              <textarea
                name="descripcion"
                value={perfil.descripcion}
                onChange={handleChange}
                className="border p-2 rounded-lg w-full"
                placeholder="Describe brevemente tu enfoque, experiencia y a quiénes atiendes"
                rows={3}
              />
            </div>

            {/* Áreas de atención */}
            <div className="mt-6">
              <label className="block text-blue-700 font-semibold mb-1">Áreas de atención</label>
              <div className="flex gap-2 mb-2">
                <input
                  value={areaInput}
                  onChange={e => setAreaInput(e.target.value)}
                  className="border p-2 rounded-lg flex-1"
                  placeholder="Ej: Ansiedad"
                />
                <button type="button" onClick={handleAddArea} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Añadir</button>
              </div>
              <ul>
                {perfil.areas_atencion.map((area, idx) => (
                  <li key={idx} className="flex items-center gap-2 mb-1">
                    <span>{area}</span>
                    <button type="button" onClick={() => handleRemoveArea(idx)} className="text-red-500 hover:underline text-xs">Eliminar</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Formación Académica */}
            <div className="mt-6">
              <label className="block text-blue-700 font-semibold mb-1">Formación Académica</label>
              <div className="flex gap-2 mb-2">
                <input
                  value={formacionInput}
                  onChange={e => setFormacionInput(e.target.value)}
                  className="border p-2 rounded-lg flex-1"
                  placeholder="Ej: Magíster en Psicología Clínica"
                />
                <button type="button" onClick={handleAddFormacion} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Añadir</button>
              </div>
              <ul>
                {perfil.formacion_academica.map((form, idx) => (
                  <li key={idx} className="flex items-center gap-2 mb-1">
                    <span>{form}</span>
                    <button type="button" onClick={() => handleRemoveFormacion(idx)} className="text-red-500 hover:underline text-xs">Eliminar</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Idiomas */}
            <div className="mt-6">
              <label className="block text-blue-700 font-semibold mb-1">Idiomas</label>
              <div className="flex gap-2 mb-2">
                <input
                  value={idiomaInput}
                  onChange={e => setIdiomaInput(e.target.value)}
                  className="border p-2 rounded-lg flex-1"
                  placeholder="Ej: Inglés"
                />
                <button type="button" onClick={handleAddIdioma} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Añadir</button>
              </div>
              <ul>
                {perfil.idiomas.map((idioma, idx) => (
                  <li key={idx} className="flex items-center gap-2 mb-1">
                    <span>{idioma}</span>
                    <button type="button" onClick={() => handleRemoveIdioma(idx)} className="text-red-500 hover:underline text-xs">Eliminar</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Experiencia */}
            <div className="mt-6">
              <label className="block text-blue-700 font-semibold mb-1">Experiencia</label>
              <textarea
                name="experiencia"
                value={perfil.experiencia}
                onChange={handleChange}
                className="border p-2 rounded-lg w-full"
                placeholder="Describe tu experiencia profesional"
              />
            </div>

            {/* Tarifas */}
            <div className="mt-6">
              <label className="block text-blue-700 font-semibold mb-1">Tarifas</label>
              <input
                name="tarifas"
                value={perfil.tarifas}
                onChange={handleChange}
                className="border p-2 rounded-lg w-full"
                placeholder="Ej: $30.000 por sesión"
              />
            </div>

            {/* Modalidad */}
            <div className="mt-6">
              <label className="block text-blue-700 font-semibold mb-1">Modalidad de atención</label>
              <div className="flex gap-2 mb-2">
                {['Online', 'Presencial'].map((mod) => {
                  const selected = Array.isArray(perfil.modalidad_atencion) ? perfil.modalidad_atencion.includes(mod) : perfil.modalidad_atencion === mod;
                  return (
                    <button
                      key={mod}
                      type="button"
                      className={`px-4 py-2 rounded-full border text-sm font-semibold transition ${selected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`}
                      onClick={() => {
                        setPerfil(prev => {
                          let actual = prev.modalidad_atencion;
                          if (!Array.isArray(actual)) actual = actual ? [actual] : [];
                          if (actual.includes(mod)) return prev; // No deselecciona si ya está
                          return { ...prev, modalidad_atencion: [...actual, mod] };
                        });
                      }}
                      disabled={selected}
                    >
                      {mod}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(Array.isArray(perfil.modalidad_atencion) ? perfil.modalidad_atencion : perfil.modalidad_atencion ? [perfil.modalidad_atencion] : []).map((mod, index) => (
                  <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center">
                    {mod}
                    <button
                      type="button"
                      onClick={() => setPerfil(prev => {
                        let actual = prev.modalidad_atencion;
                        if (!Array.isArray(actual)) actual = actual ? [actual] : [];
                        return { ...prev, modalidad_atencion: actual.filter((_, i) => i !== index) };
                      })}
                      className="ml-2 text-red-500 hover:text-red-700 text-xs"
                      title="Eliminar modalidad"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <button type="submit" className="mt-8 bg-blue-600 text-white py-2 px-6 rounded-lg font-bold hover:bg-blue-700" disabled={loading}>
              {loading ? "Guardando..." : "Guardar perfil"}
            </button>
            {error && <p className="mt-4 text-red-500">{error}</p>}
          </form>
        </div>
      </div>
    </>
  );
}
