import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Listbox, Combobox } from "@headlessui/react";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/20/solid";

export default function Register() {
  const [form, setForm] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  // Estados para los datos
  const [ciudades, setCiudades] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [comunasFiltradas, setComunasFiltradas] = useState([]);
  const [universidades, setUniversidades] = useState([]);
  const [universidadesFiltradas, setUniversidadesFiltradas] = useState([]);
  
  // Estados para selecciones
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState(null);
  const [universidadQuery, setUniversidadQuery] = useState("");

  const navigate = useNavigate();

  const safeArray = (data) => Array.isArray(data) ? data : [];

  useEffect(() => {
    const cargarDatos = async () => {
      setLoadingData(true);
      try {
        // Cargar datos en paralelo
        const [ciudadesRes, comunasRes, universidadesRes] = await Promise.all([
          fetch("/api/ciudades").then(r => r.json()),
          fetch("/api/comunas").then(r => r.json()),
          fetch("/api/universidades").then(r => r.json())
        ]);

        console.log("👉 Ciudades:", ciudadesRes);
        console.log("👉 Comunas:", comunasRes);
        console.log("👉 Universidades:", universidadesRes);

        setCiudades(safeArray(ciudadesRes));
        setComunas(safeArray(comunasRes));
        setUniversidades(safeArray(universidadesRes));
        setUniversidadesFiltradas(safeArray(universidadesRes));
      } catch (error) {
        console.error("Error cargando datos:", error);
        setMensaje("Error al cargar datos de ubicación. Intenta recargar la página.");
      } finally {
        setLoadingData(false);
      }
    };

    cargarDatos();
  }, []);

  // Filtrar comunas cuando se selecciona una ciudad
  useEffect(() => {
    if (ciudadSeleccionada && comunas.length > 0) {
      const filtradas = comunas.filter(comuna => 
        comuna.provincia && 
        comuna.provincia.region && 
        comuna.provincia.region.codigo === ciudadSeleccionada.codigo
      );
      setComunasFiltradas(filtradas);
      
      // Limpiar comuna seleccionada si no está en la nueva ciudad
      if (form.comuna && !filtradas.find(c => c.nombre === form.comuna)) {
        setForm(prev => ({ ...prev, comuna: null }));
      }
    } else {
      setComunasFiltradas([]);
    }
  }, [ciudadSeleccionada, comunas, form.comuna]);

  // Filtrar universidades según la búsqueda
  useEffect(() => {
    if (universidadQuery === "") {
      setUniversidadesFiltradas(universidades);
    } else {
      const filtradas = universidades.filter(uni =>
        uni.toLowerCase().includes(universidadQuery.toLowerCase())
      );
      setUniversidadesFiltradas(filtradas);
    }
  }, [universidadQuery, universidades]);

  const isFormValid = form.nombre && form.apellido && form.correo &&
    form.password1 && form.password2 &&
    form.universidad && form.titulo &&
    form.descripcion && form.foto &&
    form.ciudad && form.comuna &&
    form.password1 === form.password2;

  const backendRegister = async (data) => {
    setLoading(true);
    setMensaje("");
    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await response.json();

      if (result.success) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        setMensaje("¡Registro exitoso! Serás redirigido...");
        setTimeout(() => navigate("/dashboard-psicologo"), 1200);
      } else {
        setMensaje(result.error || "Error al registrar usuario.");
      }
    } catch {
      setMensaje("Error de conexión con el servidor.");
    }
    setLoading(false);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!isFormValid) return;

    const data = {
      email: form.correo,
      password: form.password1,
      tipo_usuario: "psicologo",
      nombre: form.nombre,
      apellido: form.apellido,
      universidad: form.universidad,
      titulo: form.titulo,
      foto_url: form.foto,
      descripcion: form.descripcion,
      ciudad: form.ciudad,
      comuna: form.comuna
    };

    backendRegister(data);
  };

  const handleRegisterWithoutPay = () => {
    if (!isFormValid) return;
    const data = {
      email: form.correo,
      password: form.password1,
      tipo_usuario: "psicologo",
      nombre: form.nombre,
      apellido: form.apellido,
      universidad: form.universidad,
      titulo: form.titulo,
      foto_url: form.foto,
      descripcion: form.descripcion,
      ciudad: form.ciudad,
      comuna: form.comuna,
      suscripcion_pendiente: true
    };
    backendRegister(data);
  };

  const handleCiudadChange = (ciudad) => {
    setCiudadSeleccionada(ciudad);
    setForm(prev => ({ 
      ...prev, 
      ciudad: ciudad.nombre,
      comuna: null // Resetear comuna cuando cambia ciudad
    }));
  };

  // Componente personalizado para Listbox
  const CustomListbox = ({ label, value, onChange, options, disabled = false, placeholder }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-3 pl-3 pr-10 text-left shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed">
            <span className={`block truncate ${!value ? 'text-gray-400' : 'text-gray-900'}`}>
              {value || placeholder || `Selecciona ${label}`}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {safeArray(options).map((option, idx) => (
              <Listbox.Option
                key={idx}
                className={({ active, selected }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                  }`
                }
                value={option}
              >
                {({ selected }) => (
                  <>
                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                      {typeof option === 'string' ? option : option.nombre}
                    </span>
                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );

  // Componente Combobox para universidades con búsqueda
  const UniversidadCombobox = () => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">Universidad</label>
      <Combobox value={form.universidad} onChange={(value) => setForm({ ...form, universidad: value })}>
        <div className="relative">
          <Combobox.Input
            className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-3 pr-10 shadow-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            displayValue={(universidad) => universidad}
            onChange={(event) => setUniversidadQuery(event.target.value)}
            placeholder="Busca y selecciona tu universidad"
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </Combobox.Button>
        </div>
        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {universidadesFiltradas.map((universidad, idx) => (
            <Combobox.Option
              key={idx}
              className={({ active }) =>
                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                  active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                }`
              }
              value={universidad}
            >
              {({ selected, active }) => (
                <>
                  <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                    {universidad}
                  </span>
                  {selected && (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  )}
                </>
              )}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox>
    </div>
  );

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-center">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-3xl p-8 w-full max-w-2xl space-y-4">
        <h2 className="text-3xl font-bold text-blue-700 text-center mb-6">Registro Psicólogos</h2>

        {/* Información personal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
            <input 
              name="nombre" 
              placeholder="Ingresa tu nombre" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={e => setForm({ ...form, nombre: e.target.value })} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
            <input 
              name="apellido" 
              placeholder="Ingresa tu apellido" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={e => setForm({ ...form, apellido: e.target.value })} 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Correo electrónico</label>
          <input 
            type="email" 
            name="correo" 
            placeholder="tu@email.com" 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onChange={e => setForm({ ...form, correo: e.target.value })} 
          />
        </div>

        {/* Información académica */}
        <UniversidadCombobox />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Título Profesional</label>
          <input 
            name="titulo" 
            placeholder="Ej: Psicólogo, Magíster en Psicología Clínica" 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onChange={e => setForm({ ...form, titulo: e.target.value })} 
          />
        </div>

        {/* Ubicación */}
        <CustomListbox
          label="Ciudad"
          value={ciudadSeleccionada}
          onChange={handleCiudadChange}
          options={ciudades}
          placeholder="Selecciona tu ciudad"
        />

        <CustomListbox
          label="Comuna"
          value={form.comuna}
          onChange={val => setForm({ ...form, comuna: val })}
          options={comunasFiltradas.map(c => c.nombre)}
          disabled={!ciudadSeleccionada}
          placeholder={!ciudadSeleccionada ? "Primero selecciona una ciudad" : "Selecciona tu comuna"}
        />

        {/* Información adicional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">URL de Foto de Perfil</label>
          <input 
            name="foto" 
            placeholder="https://ejemplo.com/mi-foto.jpg" 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onChange={e => setForm({ ...form, foto: e.target.value })} 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Descripción Profesional</label>
          <textarea 
            name="descripcion" 
            placeholder="Describe tu experiencia, especialidades y enfoque terapéutico..." 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            onChange={e => setForm({ ...form, descripcion: e.target.value })} 
          />
        </div>

        {/* Contraseñas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
            <input 
              name="password1" 
              placeholder="Mínimo 8 caracteres" 
              type="password" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={e => setForm({ ...form, password1: e.target.value })} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña</label>
            <input 
              name="password2" 
              placeholder="Repite tu contraseña" 
              type="password" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={e => setForm({ ...form, password2: e.target.value })} 
            />
          </div>
        </div>

        {/* Validación de contraseñas */}
        {form.password1 && form.password2 && form.password1 !== form.password2 && (
          <div className="text-red-600 text-sm">Las contraseñas no coinciden</div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 Para activar tu perfil y comenzar a recibir pacientes, deberás completar el proceso de suscripción.
          </p>
        </div>

        {/* Botones */}
        <div className="space-y-3">
          <button 
            type="submit" 
            disabled={!isFormValid || loading} 
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Registrando...
              </div>
            ) : "Pagar y Activar Perfil"}
          </button>

          <button 
            type="button" 
            onClick={handleRegisterWithoutPay} 
            disabled={!isFormValid || loading} 
            className="w-full border-2 border-blue-600 text-blue-600 py-3 px-6 rounded-xl shadow hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Registrarme sin pagar (perfil inactivo)
          </button>
        </div>

        {mensaje && (
          <div className={`p-4 rounded-lg text-center font-medium ${
            mensaje.includes("exitoso") 
              ? "bg-green-100 text-green-800 border border-green-200" 
              : "bg-red-100 text-red-800 border border-red-200"
          }`}>
            {mensaje}
          </div>
        )}
      </form>
    </div>
  );
}