import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderDashboard from "../Components/HeaderDashboard";
import Modal from "../Components/Modal";
import { subirFoto } from "../api/subirFotoPerfil";

export default function MiPerfil() {
  const navigate = useNavigate();
  const [psicologo, setPsicologo] = useState({
    nombre: '',
    apellido: '',
    descripcion: '',
    universidad: '',
    areas: [],         // Áreas de atención en frontend
    formacion: [],     // Formación académica en frontend
    enfoque: '',       // Enfoque terapéutico en frontend
    experiencia: '',
    idiomas: [],       // Idiomas en frontend (ahora es un array)
    tarifas: ''
  });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [perfilOriginal, setPerfilOriginal] = useState(null);
  const [fileUpload, setFileUpload] = useState(null);
  
  // Manejo de arrays para áreas, formación e idiomas
  const [areaInput, setAreaInput] = useState("");
  const [formacionInput, setFormacionInput] = useState("");
  const [idiomaInput, setIdiomaInput] = useState("");

  // Función para obtener los datos del psicólogo, definida fuera de useEffect para que sea accesible desde otras funciones
  const getPsicologo = async () => {
    try {
      setLoading(true);
      // Obtener datos de autenticación
      const token = localStorage.getItem("token");
      const userString = localStorage.getItem("user");
        
        if (!token || !userString) {
          console.error("No hay token o usuario en localStorage");
          navigate('/login');
          return;
        }
        
        // Verificar que sea un psicólogo
        const user = JSON.parse(userString);
        
        if (!user || user.tipo_usuario !== 'psicologo') {
          console.error("El usuario no es un psicólogo o no está definido correctamente");
          navigate('/login');
          return;
        }

        // Intentar obtener el perfil desde la API
        try {
          const resp = await fetch("http://localhost:5000/api/profile", {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          
          if (!resp.ok) {
            throw new Error(`Error: ${resp.status} ${resp.statusText}`);
          }
          
          const data = await resp.json();
          
          if (data.success && data.profile) {
            // console.log("Datos recibidos del servidor:", data.profile);
            
            // Mapear campos de la base de datos a nombres usados en el frontend
            const profileData = {
              ...data.profile,
              
              // Mapear áreas_atencion a areas
              areas: (() => {
                if (data.profile.areas_atencion) {
                  if (Array.isArray(data.profile.areas_atencion)) {
                    return [...data.profile.areas_atencion];
                  }
                  if (typeof data.profile.areas_atencion === 'string') {
                    return data.profile.areas_atencion.split(',').map(item => item.trim()).filter(Boolean);
                  }
                }
                return [];
              })(),
              
              // Mapear formacion_academica a formacion
              formacion: (() => {
                if (data.profile.formacion_academica) {
                  if (Array.isArray(data.profile.formacion_academica)) {
                    return [...data.profile.formacion_academica];
                  }
                  if (typeof data.profile.formacion_academica === 'string') {
                    return data.profile.formacion_academica.split(',').map(item => item.trim()).filter(Boolean);
                  }
                }
                return [];
              })(),
              
              // Mapear enfoque_terapeutico a enfoque
              enfoque: data.profile.enfoque_terapeutico || '',
              
              // Mapear idiomas (si viene como string, convertirlo a array)
              idiomas: (() => {
                if (data.profile.idiomas) {
                  if (Array.isArray(data.profile.idiomas)) {
                    return [...data.profile.idiomas];
                  }
                  if (typeof data.profile.idiomas === 'string') {
                    return data.profile.idiomas.split(',').map(item => item.trim()).filter(Boolean);
                  }
                }
                return [];
              })(),
              // Mapear modalidad_atencion (si viene como string, convertirlo a array)
              modalidad_atencion: (() => {
                if (data.profile.modalidad_atencion) {
                  if (Array.isArray(data.profile.modalidad_atencion)) {
                    return [...data.profile.modalidad_atencion];
                  }
                  if (typeof data.profile.modalidad_atencion === 'string') {
                    try {
                      const parsed = JSON.parse(data.profile.modalidad_atencion);
                      if (Array.isArray(parsed)) return parsed.map(item => String(item).trim());
                    } catch {
                      return data.profile.modalidad_atencion.split(',').map(item => item.replace(/\[|\]|"/g, '').trim()).filter(Boolean);
                    }
                  }
                }
                return [];
              })()
            };
            
            setPsicologo(profileData);
            setPerfilOriginal(JSON.parse(JSON.stringify(profileData)));
          } else {
            throw new Error("Datos de perfil no válidos");
          }
        } catch (apiError) {
          console.error("Error con la API, usando datos de prueba:", apiError);
          
          // Usar datos de prueba cuando la API falla
          const dataPrueba = {
            nombre: user.displayName?.split(' ')[0] || "Nombre",
            apellido: user.displayName?.split(' ')[1] || "Apellido",
            descripcion: "Psicólogo especialista",
            universidad: "Universidad Nacional",
            // Usando los mismos nombres de campo que en el resto del frontend
            areas: ["Ansiedad", "Depresión", "Estrés"],
            enfoque: "Terapia cognitivo-conductual",
            formacion: ["Licenciatura en Psicología", "Maestría en Psicología Clínica"],
            experiencia: "5 años de experiencia en atención clínica",
            idiomas: ["Español", "Inglés"],  // Ahora es un array
            tarifas: "$50 USD por sesión"
          };
          setPsicologo(dataPrueba);
          setPerfilOriginal(JSON.parse(JSON.stringify(dataPrueba)));
        }
      } catch (error) {
        console.error("Error obteniendo perfil:", error);
      }
      setLoading(false);
    };
  
  // Llamar a getPsicologo al montar el componente
  useEffect(() => {
    getPsicologo();
  }, [navigate]);

  const handleEditClick = () => {
    // Asegurarnos de que los arrays estén inicializados al entrar en modo edición
    setPsicologo(prevState => ({
      ...prevState,
      areas: Array.isArray(prevState.areas) ? prevState.areas : [],
      formacion: Array.isArray(prevState.formacion) ? prevState.formacion : [],
      idiomas: Array.isArray(prevState.idiomas) ? prevState.idiomas : []
    }));
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setPsicologo(JSON.parse(JSON.stringify(perfilOriginal)));
    setEditMode(false);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPsicologo({ ...psicologo, [name]: value });
  };

  const handleAreaAdd = () => {
    if (areaInput.trim()) {
      // Asegurar que psicologo.areas sea un array y limpiar el valor de entrada
      const currentAreas = Array.isArray(psicologo.areas) ? psicologo.areas : [];
      const cleanedArea = areaInput.trim().replace(/["\[\]\n\r]/g, '');
      setPsicologo({ ...psicologo, areas: [...currentAreas, cleanedArea] });
      setAreaInput("");
    }
  };

  const handleAreaRemove = (index) => {
    // Asegurar que psicologo.areas sea un array
    if (!Array.isArray(psicologo.areas)) return;
    
    const newAreas = [...psicologo.areas];
    newAreas.splice(index, 1);
    setPsicologo({ ...psicologo, areas: newAreas });
  };

  const handleFormacionAdd = () => {
    if (formacionInput.trim()) {
      // Asegurar que psicologo.formacion sea un array y limpiar el valor de entrada
      const currentFormacion = Array.isArray(psicologo.formacion) ? psicologo.formacion : [];
      const cleanedFormacion = formacionInput.trim().replace(/["\[\]\n\r]/g, '');
      setPsicologo({ ...psicologo, formacion: [...currentFormacion, cleanedFormacion] });
      setFormacionInput("");
    }
  };

  const handleFormacionRemove = (index) => {
    // Asegurar que psicologo.formacion sea un array
    if (!Array.isArray(psicologo.formacion)) return;
    
    const newFormacion = [...psicologo.formacion];
  };

  // Manejadores para idiomas
  const handleIdiomaAdd = () => {
    if (idiomaInput.trim()) {
      // Asegurar que psicologo.idiomas sea un array y limpiar el valor de entrada
      const currentIdiomas = Array.isArray(psicologo.idiomas) ? psicologo.idiomas : [];
      const cleanedIdioma = idiomaInput.trim().replace(/["\[\]\n\r]/g, '');
      setPsicologo({ ...psicologo, idiomas: [...currentIdiomas, cleanedIdioma] });
      setIdiomaInput("");
    }
  };

  const handleIdiomaRemove = (index) => {
    // Asegurar que psicologo.idiomas sea un array
    if (!Array.isArray(psicologo.idiomas)) return;
    
    const newIdiomas = [...psicologo.idiomas];
    newIdiomas.splice(index, 1);
    setPsicologo({ ...psicologo, idiomas: newIdiomas });
  };

  const handleFileChange = (e) => {
    setFileUpload(e.target.files[0]);
  };

  const handleUploadPhoto = async () => {
    if (!fileUpload) return;
    
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      setSaving(true);
      const uploadResult = await subirFoto(fileUpload, token);
      
      if (uploadResult.success) {
        setPsicologo({ ...psicologo, foto_url: uploadResult.url });
        setSuccessMsg("Foto actualizada correctamente");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        throw new Error("Error al subir la foto");
      }
    } catch (error) {
      console.error("Error al subir foto:", error);
      setErrorMsg("Error al subir la foto: " + error.message);
      setTimeout(() => setErrorMsg(""), 3000);
    } finally {
      setFileUpload(null);
      setSaving(false);
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    setErrorMsg("");
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No hay token de autenticación");
      }
      
        // Limpiamos y preparamos los datos antes de enviar
      const datosAEnviar = { ...psicologo };
      
      // Mapeamos los nombres de campos del frontend a los de la base de datos
      if (datosAEnviar.areas) {
        // Limpiar cualquier formato extraño de las áreas
        const areasLimpias = Array.isArray(datosAEnviar.areas) 
          ? datosAEnviar.areas.map(area => {
              if (typeof area === 'string') {
                return area.replace(/["\[\]\n\r]/g, '').trim();
              }
              return area;
            }).filter(Boolean)
          : [];
          
        datosAEnviar.areas_atencion = areasLimpias;
        delete datosAEnviar.areas;
      }
      
      if (datosAEnviar.formacion) {
        // Limpiar cualquier formato extraño de la formación
        const formacionLimpia = Array.isArray(datosAEnviar.formacion)
          ? datosAEnviar.formacion.map(item => {
              if (typeof item === 'string') {
                return item.replace(/["\[\]\n\r]/g, '').trim();
              }
              return item;
            }).filter(Boolean)
          : [];
          
        datosAEnviar.formacion_academica = formacionLimpia;
        delete datosAEnviar.formacion;
      }
      
      if (datosAEnviar.enfoque) {
        datosAEnviar.enfoque_terapeutico = datosAEnviar.enfoque;
        delete datosAEnviar.enfoque;
      }
      
      // Manejar idiomas como array
      if (datosAEnviar.idiomas) {
        // Limpiar cualquier formato extraño de los idiomas
        const idiomasLimpios = Array.isArray(datosAEnviar.idiomas)
          ? datosAEnviar.idiomas.map(idioma => {
              if (typeof idioma === 'string') {
                return idioma.replace(/["\[\]\n\r]/g, '').trim();
              }
              return idioma;
            }).filter(Boolean)
          : [];
          
        // Asegurarnos de que se envía como array
        datosAEnviar.idiomas = idiomasLimpios;
      }
      
      // Aseguramos que áreas y formación sean arrays
      if (datosAEnviar.areas_atencion && !Array.isArray(datosAEnviar.areas_atencion)) {
        if (typeof datosAEnviar.areas_atencion === 'string') {
          datosAEnviar.areas_atencion = datosAEnviar.areas_atencion.split(',').map(item => item.trim()).filter(Boolean);
        } else {
          datosAEnviar.areas_atencion = [];
        }
      }
      
      if (datosAEnviar.formacion_academica && !Array.isArray(datosAEnviar.formacion_academica)) {
        if (typeof datosAEnviar.formacion_academica === 'string') {
          datosAEnviar.formacion_academica = datosAEnviar.formacion_academica.split(',').map(item => item.trim()).filter(Boolean);
        } else {
          datosAEnviar.formacion_academica = [];
        }
      }
      
  // console.log("Enviando datos al servidor:", datosAEnviar);

      const resp = await fetch("http://localhost:5000/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(datosAEnviar)
      });
      
      if (!resp.ok) {
        const errorText = await resp.text();
        console.error("Respuesta de error:", resp.status, errorText);
        throw new Error(`Error del servidor: ${resp.status} ${resp.statusText}`);
      }

      const data = await resp.json();
      
      if (data.success) {
  // console.log("Perfil actualizado con éxito:", data);
        
        // Mostrar mensaje de éxito
        setSuccessMsg("Perfil actualizado correctamente");
        
        // Recargar datos del perfil desde el servidor para obtener los valores actualizados
        getPsicologo();
        
        // Salir del modo edición después de un breve retraso
        setTimeout(() => {
          setSuccessMsg("");
          setEditMode(false);
        }, 1500);
      } else {
        throw new Error(data.message || "Error al actualizar el perfil");
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      setErrorMsg(error.message || "Error al guardar los cambios");
    } finally {
      setSaving(false);
      setShowConfirmModal(false);
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

  return (
    <>
      <HeaderDashboard />
      <div className="h-24 bg-gradient-to-br from-blue-50 to-blue-100"></div> {/* Espacio fijo para el header con fondo celeste */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-8">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-4 md:p-8">
            
            <div className="flex justify-between items-center mb-6">
            {!editMode && (
              <button
                onClick={() => navigate('/dashboard-psicologo')}
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                ← Volver al dashboard
              </button>
            )}
            {editMode && <div className="w-6"></div>} {/* Espacio vacío para mantener alineación cuando no hay botón */}
            
            {!editMode ? (
              <button
                onClick={handleEditClick}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Editar perfil
              </button>
            ) : (
              <div className="flex space-x-2 ml-auto">
                <button
                  onClick={handleCancelEdit}
                  className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  disabled={saving}
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            )}
          </div>
          
          {errorMsg && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {successMsg}
            </div>
          )}

          {/* Foto y datos básicos */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
            {/* Foto de perfil */}
            <div className="flex flex-col items-center">
              <img
                src={psicologo.foto_path || psicologo.foto_url || 'https://via.placeholder.com/140'}
                alt="Perfil"
                className="w-40 h-40 rounded-full object-cover border-4 border-blue-300 shadow-md mb-3"
              />
              {editMode && (
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
              )}
            </div>
            
            {/* Información básica */}
            <div className="flex-1 w-full">
              {!editMode ? (
                <>
                  <h2 className="text-3xl font-extrabold text-blue-800 mb-2">{psicologo.nombre} {psicologo.apellido}</h2>
                  <p className="text-blue-600 font-semibold mb-2">{psicologo.descripcion || 'Especialización no disponible'}</p>
                  <p className="text-gray-700 mb-2">{psicologo.universidad || 'Universidad no disponible'}</p>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-4 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      <input
                        type="text"
                        name="nombre"
                        value={psicologo.nombre || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                      <input
                        type="text"
                        name="apellido"
                        value={psicologo.apellido || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción profesional</label>
                    <input
                      type="text"
                      name="descripcion"
                      value={psicologo.descripcion || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Psicólogo clínico especialista en..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Universidad</label>
                    <p className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600">
                      {psicologo.universidad || "No disponible"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Áreas de atención y Enfoque */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Áreas de atención */}
            <div className="bg-blue-50 p-6 rounded-2xl shadow border border-blue-100">
              <h3 className="text-xl font-bold text-blue-700 mb-3">Áreas de atención</h3>
              {!editMode ? (
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(psicologo.areas) && psicologo.areas.length > 0) ? 
                    psicologo.areas.map((area, i) => (
                      <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                        {typeof area === 'string' ? area.replace(/["\[\]\n\r]/g, '').trim() : area}
                      </span>
                    )) : 
                    <span className="text-gray-600">Sin información</span>
                  }
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={areaInput}
                      onChange={(e) => setAreaInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Añadir área (ej: Ansiedad, Depresión...)"
                      onKeyPress={(e) => e.key === 'Enter' && handleAreaAdd()}
                    />
                    <button
                      type="button"
                      onClick={handleAreaAdd}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Añadir
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(psicologo.areas || []).map((area, index) => (
                      <div key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center">
                        <span>{area}</span>
                        <button
                          type="button"
                          onClick={() => handleAreaRemove(index)}
                          className="ml-2 text-blue-500 hover:text-blue-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Enfoque terapéutico */}
            <div className="bg-blue-50 p-6 rounded-2xl shadow border border-blue-100">
              <h3 className="text-xl font-bold text-blue-700 mb-3">Enfoque Terapéutico</h3>
              {!editMode ? (
                <p className="text-gray-700">{psicologo.enfoque || 'Sin información disponible'}</p>
              ) : (
                <textarea
                  name="enfoque"
                  value={psicologo.enfoque || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  placeholder="Describe tu enfoque terapéutico..."
                ></textarea>
              )}
            </div>

            {/* Formación académica */}
            <div className="bg-blue-50 p-6 rounded-2xl shadow border border-blue-100">
              <h3 className="text-xl font-bold text-blue-700 mb-3">Formación Académica</h3>
              {!editMode ? (
                <ul className="list-disc list-inside text-gray-700">
                  {(Array.isArray(psicologo.formacion) && psicologo.formacion.length > 0) ?
                    psicologo.formacion.map((f, i) => (
                      <li key={i}>{typeof f === 'string' ? f.replace(/["\[\]\n\r]/g, '').trim() : f}</li>
                    )) :
                    <li className="text-gray-600">Sin información</li>
                  }
                </ul>
              ) : (
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={formacionInput}
                      onChange={(e) => setFormacionInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Añadir formación (ej: Licenciatura en Psicología...)"
                      onKeyPress={(e) => e.key === 'Enter' && handleFormacionAdd()}
                    />
                    <button
                      type="button"
                      onClick={handleFormacionAdd}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Añadir
                    </button>
                  </div>
                  <ul className="list-disc list-inside space-y-2 mt-2">
                    {(psicologo.formacion || []).map((item, index) => (
                      <li key={index} className="flex items-center">
                        <span className="flex-1">{item}</span>
                        <button
                          type="button"
                          onClick={() => handleFormacionRemove(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Eliminar
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Experiencia profesional */}
            <div className="bg-blue-50 p-6 rounded-2xl shadow border border-blue-100">
              <h3 className="text-xl font-bold text-blue-700 mb-3">Experiencia Profesional</h3>
              {!editMode ? (
                <p className="text-gray-700">{psicologo.experiencia || 'Sin información disponible'}</p>
              ) : (
                <textarea
                  name="experiencia"
                  value={psicologo.experiencia || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  placeholder="Describe tu experiencia profesional..."
                ></textarea>
              )}
            </div>
          </div>

          {/* Idiomas y Tarifas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-blue-50 p-6 rounded-2xl shadow border border-blue-100">
              <h3 className="text-xl font-bold text-blue-700 mb-3">Idiomas</h3>
              {!editMode ? (
                <ul className="list-disc list-inside text-gray-700">
                  {(Array.isArray(psicologo.idiomas) && psicologo.idiomas.length > 0) ?
                    psicologo.idiomas.map((idioma, i) => (
                      <li key={i}>{typeof idioma === 'string' ? idioma.replace(/["\[\]\n\r]/g, '').trim() : idioma}</li>
                    )) :
                    <li className="text-gray-600">Sin información</li>
                  }
                </ul>
              ) : (
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={idiomaInput}
                      onChange={(e) => setIdiomaInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Añadir idioma (ej: Español, Inglés...)"
                      onKeyPress={(e) => e.key === 'Enter' && handleIdiomaAdd()}
                    />
                    <button
                      type="button"
                      onClick={handleIdiomaAdd}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Añadir
                    </button>
                  </div>
                  <ul className="list-disc list-inside space-y-2 mt-2">
                    {(psicologo.idiomas || []).map((idioma, index) => (
                      <li key={index} className="flex items-center">
                        <span className="flex-1">{idioma}</span>
                        <button
                          type="button"
                          onClick={() => handleIdiomaRemove(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Eliminar
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="bg-blue-50 p-6 rounded-2xl shadow border border-blue-100">
              <h3 className="text-xl font-bold text-blue-700 mb-3">Tarifas y Pago</h3>
              {!editMode ? (
                <p className="text-gray-700">{psicologo.tarifas || 'Sin información disponible'}</p>
              ) : (
                <input
                  type="text"
                  name="tarifas"
                  value={psicologo.tarifas || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: $50 USD por sesión"
                />
              )}
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl shadow border border-blue-100">
              <h3 className="text-xl font-bold text-blue-700 mb-3">Modalidades</h3>
              {!editMode ? (
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(psicologo.modalidad_atencion) && psicologo.modalidad_atencion.length > 0) ?
                    psicologo.modalidad_atencion.map((mod, i) => (
                      <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                        {typeof mod === 'string' ? mod.replace(/["\[\]\n\r]/g, '').trim() : mod}
                      </span>
                    )) :
                    <span className="text-gray-600">Sin información disponible</span>
                  }
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {['Online', 'Presencial'].map((mod) => {
                      const selected = (psicologo.modalidad_atencion || []).includes(mod);
                      return (
                        <button
                          key={mod}
                          type="button"
                          className={`px-4 py-2 rounded-full border text-sm font-semibold transition ${selected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`}
                          onClick={() => {
                            setPsicologo(prev => {
                              const actual = prev.modalidad_atencion || [];
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
                    {(psicologo.modalidad_atencion || []).map((mod, index) => (
                      <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center">
                        {mod}
                        <button
                          type="button"
                          onClick={() => setPsicologo(prev => ({ ...prev, modalidad_atencion: prev.modalidad_atencion.filter((_, i) => i !== index) }))}
                          className="ml-2 text-red-500 hover:text-red-700 text-xs"
                          title="Eliminar modalidad"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {!editMode && (
            <div className="text-center">
              <button
                onClick={() => navigate('/dashboard-psicologo')}
                className="bg-blue-600 text-white px-10 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition"
              >
                Volver al dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleSaveChanges}
          title="Confirmar cambios"
          message="¿Estás seguro de que deseas guardar los cambios en tu perfil?"
          confirmText="Guardar"
        />
      )}
    </>
  );
}
