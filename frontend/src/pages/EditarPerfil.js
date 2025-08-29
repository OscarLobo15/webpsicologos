import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../Components/Modal";
import HeaderDashboard from "../Components/HeaderDashboard";
import { subirFoto } from "../api/subirFotoPerfil";

export default function EditarPerfil() {
    const navigate = useNavigate();
  const [psicologo, setPsicologo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState({});
  const [fileUpload, setFileUpload] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
    confirmText: ""
  });

  useEffect(() => {
    const getPsicologo = async () => {
      try {
        const token = localStorage.getItem("token");
        const userString = localStorage.getItem("user");
        
        if (!token || !userString) {
          console.error("No hay token o usuario en localStorage");
          navigate('/login');
          return;
        }
        
        const user = JSON.parse(userString);
        
        if (!user || user.tipo_usuario !== 'psicologo') {
          console.error("El usuario no es un psicólogo o no está definido correctamente");
          navigate('/login');
          return;
        }

        const resp = await fetch("http://localhost:5000/api/profile", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!resp.ok) {
          console.error("Error en la respuesta:", resp.status, resp.statusText);
          const text = await resp.text();
          console.error("Cuerpo de respuesta:", text);
          setLoading(false);
          return;
        }
        
        const data = await resp.json();
        
        if (data.success && data.profile) {
          setPsicologo(data.profile);
        } else {
          console.error("Error obteniendo perfil:", data);
          // No navegamos automáticamente para poder ver el error
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error obteniendo perfil:", error);
      }
      setLoading(false);
    };

    getPsicologo();
  }, [navigate]);

  const handleEdit = (field) => {
    setEditMode(prev => ({ ...prev, [field]: true }));
  };

  const handleCancel = (field) => {
    setEditMode(prev => ({ ...prev, [field]: false }));
  };

  const capitalizeFirst = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  const handleChange = (field, value) => {
    let newValue = value;
    if (!["email", "correo", "password", "foto_path"].includes(field)) {
      // Si es campo de lista (áreas, formación, idiomas), capitalizar cada elemento y guardar como array
      if (["areas", "formacion", "idiomas"].includes(field)) {
        newValue = value
          .split(',')
          .map(v => capitalizeFirst(v.trim()))
          .filter(Boolean);
      } else {
        newValue = capitalizeFirst(value);
      }
    }
    setPsicologo(prev => ({ ...prev, [field]: newValue }));
  };

  const handleFileChange = (e) => {
    setFileUpload(e.target.files[0]);
  };

  const handleSubmit = async (field) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setShowModal(true);
      setModalConfig({
        title: "Confirmar cambios",
        message: `¿Estás seguro de que deseas guardar los cambios en ${field}?`,
        onConfirm: async () => {
          try {
            const resp = await fetch(`http://localhost:5000/api/profile`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({ [field]: psicologo[field] })
            });
            
            const data = await resp.json();
            
            if (data.success) {
              setEditMode(prev => ({ ...prev, [field]: false }));
            } else {
              console.error("Error actualizando el perfil:", data.message);
            }
          } catch (error) {
            console.error("Error en la actualización:", error);
          }
          setShowModal(false);
        },
        confirmText: "Guardar"
      });
    } catch (error) {
      console.error("Error en el envío:", error);
    }
  };

  const handleUploadPhoto = async () => {
    if (!fileUpload) return;
    
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setShowModal(true);
      setModalConfig({
        title: "Actualizar foto de perfil",
        message: "¿Estás seguro de que deseas cambiar tu foto de perfil?",
        onConfirm: async () => {
          const uploadResult = await subirFoto(fileUpload, token);
          if (uploadResult.success) {
            // Actualiza el estado local con la nueva URL de la foto
            setPsicologo(prev => ({ 
              ...prev, 
              foto_url: uploadResult.url || prev.foto_url
            }));
          }
          setFileUpload(null);
          setShowModal(false);
        },
        confirmText: "Actualizar"
      });
    } catch (error) {
      console.error("Error al subir foto:", error);
      setFileUpload(null);
    }
  };

  if (loading) return <div className="text-center pt-32 text-gray-600">Cargando perfil...</div>;
  if (!psicologo) {
    return (
      <div className="text-center pt-32">
        <div className="text-red-600 font-bold text-xl mb-4">Perfil no encontrado</div>
        <p className="text-gray-600 mb-4">No se pudo cargar la información del perfil.</p>
        <button
          onClick={() => navigate('/dashboard-psicologo')}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
        >
          Volver al Dashboard
        </button>
      </div>
    );
  }

  const EditableField = ({ field, label, value, type = "text", options = null }) => {
    // Para campos de lista, mostrar como string separado por coma
    const displayValue = Array.isArray(value) ? value.join(", ") : value || "";
    return (
      <>
        {editMode[field] ? (
          <div className="flex flex-col mb-3">
            <label className="text-sm text-blue-700 mb-1">{label}</label>
            {type === "textarea" ? (
              <textarea
                value={!["email", "correo", "password", "foto_path"].includes(field) ? displayValue : (value || "")}
                onChange={(e) => handleChange(field, e.target.value)}
                className="border p-2 rounded-lg mb-2"
                rows={3}
              />
            ) : type === "select" ? (
              <select
                value={value || ""}
                onChange={(e) => handleChange(field, e.target.value)}
                className="border p-2 rounded-lg mb-2"
              >
                {options.map((option, idx) => (
                  <option key={idx} value={option}>{option}</option>
                ))}
              </select>
            ) : (
              <input
                type={type}
                value={!["email", "correo", "password", "foto_path"].includes(field) ? displayValue : (value || "")}
                onChange={(e) => handleChange(field, e.target.value)}
                className="border p-2 rounded-lg mb-2"
              />
            )}
            <div className="flex gap-2">
              <button 
                onClick={() => handleSubmit(field)}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Guardar
              </button>
              <button 
                onClick={() => handleCancel(field)}
                className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            {type !== "array" ? (
              <p className="text-gray-700">{displayValue || 'No disponible'}</p>
            ) : (
              <div className="flex flex-wrap gap-2 my-2">
                {(value || ["Sin información"]).map((item, i) => (
                  <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">{item}</span>
                ))}
              </div>
            )}
            <button 
              onClick={() => handleEdit(field)}
              className="ml-2 text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Editar
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <HeaderDashboard />
      <div className="h-24 bg-gradient-to-br from-blue-50 to-blue-100"></div> {/* Espacio fijo para el header con fondo celeste */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-8">
          
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-blue-800">Editar mi perfil</h1>
            <button
              onClick={() => navigate('/dashboard-psicologo')}
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              ← Volver al dashboard
            </button>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
            <div className="flex flex-col items-center">
              <img
                src={psicologo.foto_path || psicologo.foto_url || 'https://via.placeholder.com/140'}
                alt="Perfil"
                className="w-40 h-40 rounded-full object-cover border-4 border-blue-300 shadow-md mb-3"
              />
              <div className="mt-2">
                <input 
                  type="file" 
                  id="photo" 
                  onChange={handleFileChange}
                  className="hidden" 
                  accept="image/*"
                />
                <label 
                  htmlFor="photo"
                  className="bg-blue-600 text-white px-3 py-2 rounded text-sm cursor-pointer hover:bg-blue-700"
                >
                  Cambiar foto
                </label>
                {fileUpload && (
                  <button
                    onClick={handleUploadPhoto}
                    className="ml-2 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
                  >
                    Subir
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex-1 w-full">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-blue-700">Datos personales</h2>
                <div className="flex gap-4 mt-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-800">Nombre</h3>
                    <EditableField field="nombre" label="Nombre" value={psicologo.nombre} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-800">Apellido</h3>
                    <EditableField field="apellido" label="Apellido" value={psicologo.apellido} />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-blue-800">Especialización</h3>
                <EditableField field="descripcion" label="Especialización" value={psicologo.descripcion} />
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-blue-800">Universidad</h3>
                <p className="text-gray-700">{psicologo.universidad || 'No disponible'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-blue-50 p-6 rounded-2xl shadow border border-blue-100">
              <h3 className="text-xl font-bold text-blue-700 mb-3">Áreas de atención</h3>
              <EditableField 
                field="areas" 
                label="Áreas de atención (separadas por coma)" 
                value={psicologo.areas && Array.isArray(psicologo.areas) ? psicologo.areas.join(", ") : ""} 
                type="textarea"
              />
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl shadow border border-blue-100">
              <h3 className="text-xl font-bold text-blue-700 mb-3">Enfoque Terapéutico</h3>
              <EditableField 
                field="enfoque" 
                label="Enfoque terapéutico" 
                value={psicologo.enfoque} 
                type="textarea"
              />
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl shadow border border-blue-100">
              <h3 className="text-xl font-bold text-blue-700 mb-3">Formación Académica</h3>
              <EditableField 
                field="formacion" 
                label="Formación académica (separada por coma)" 
                value={psicologo.formacion ? psicologo.formacion.join(", ") : ""} 
                type="textarea"
              />
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl shadow border border-blue-100">
              <h3 className="text-xl font-bold text-blue-700 mb-3">Experiencia Profesional</h3>
              <EditableField 
                field="experiencia" 
                label="Experiencia profesional" 
                value={psicologo.experiencia} 
                type="textarea"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-blue-50 p-6 rounded-2xl shadow border border-blue-100">
              <h3 className="text-xl font-bold text-blue-700 mb-3">Idiomas</h3>
              <EditableField 
                field="idiomas" 
                label="Idiomas (separados por coma)" 
                value={psicologo.idiomas} 
                type="text"
              />
            </div>
            <div className="bg-blue-50 p-6 rounded-2xl shadow border border-blue-100">
              <h3 className="text-xl font-bold text-blue-700 mb-3">Tarifas y Pago</h3>
              <EditableField 
                field="tarifas" 
                label="Tarifas y métodos de pago" 
                value={psicologo.tarifas} 
                type="textarea"
              />
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/dashboard-psicologo')}
              className="bg-blue-600 text-white px-10 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition"
            >
              Volver al dashboard
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
      />
    </>
  );
}