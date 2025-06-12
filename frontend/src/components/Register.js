import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const opciones = [
  { value: "psicologo", label: "Soy Psicólogo/a" },
  { value: "cliente", label: "Busco Psicólogo/a" }
];

const camposBase = {
  nombre: "",
  apellido: "",
  correo: "",
  password1: "",
  password2: "",
};

const camposPsicologo = {
  universidad: "",
  titulo: "",
  foto: "",
  descripcion: "",
  ciudad: "",
  comuna: "",
};

export default function Register() {
  const [tipo, setTipo] = useState("");
  const [form, setForm] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const isRequiredEmpty = (campo) => {
    if (tipo === "psicologo" && Object.keys(camposPsicologo).includes(campo)) {
      return !form[campo];
    }
    if (Object.keys(camposBase).includes(campo)) {
      return !form[campo];
    }
    return false;
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBlur = e => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const camposRequeridos = tipo === "psicologo"
    ? { ...camposBase, ...camposPsicologo }
    : camposBase;

  const isFormValid = Object.keys(camposRequeridos).every(
    (c) => form[c] && form[c].trim() !== ""
  ) && (form.password1 === form.password2);

  // REGISTRO AL BACKEND (mejorado con token, perfil y redirección)
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
        // Guarda token y usuario si los retorna el backend
        if (result.token) localStorage.setItem("token", result.token);
        if (result.user) localStorage.setItem("user", JSON.stringify(result.user));

        // Si hay token, consulta el perfil extendido y guárdalo también
        if (result.token) {
          fetch("http://localhost:5000/api/profile", {
            method: "GET",
            headers: { Authorization: "Bearer " + result.token }
          })
            .then(res => res.json())
            .then(profileData => {
              if (profileData.success) {
                localStorage.setItem("perfil", JSON.stringify(profileData.perfil));
              }
              setMensaje("¡Registro exitoso! Serás redirigido...");
              setForm({});
              setSubmitted(false);
              setTimeout(() => {
                if (data.tipo_usuario === "cliente") {
                  navigate("/search");
                } else {
                  navigate("/dashboard-psicologo");
                }
              }, 1200);
            });
        } else {
          // Si no retorna token, redirige igual
          setMensaje("¡Registro exitoso! Ya puedes iniciar sesión.");
          setForm({});
          setSubmitted(false);
          setTimeout(() => {
            if (data.tipo_usuario === "cliente") {
              navigate("/search");
            } else {
              navigate("/dashboard-psicologo");
            }
          }, 1200);
        }
      } else {
        setMensaje(result.error || "Error al registrar usuario.");
      }
    } catch (err) {
      setMensaje("Error de conexión con el servidor.");
    }
    setLoading(false);
  };

  const handleSubmit = e => {
    e.preventDefault();
    setMensaje("");
    setSubmitted(true);

    if (!isFormValid) return;

    // Construir el payload
    const data = {
      email: form.correo,
      password: form.password1,
      tipo_usuario: tipo, // "psicologo" o "cliente"
      nombre: form.nombre,
      apellido: form.apellido,
    };

    if (tipo === "psicologo") {
      data.universidad = form.universidad;
      data.titulo = form.titulo;
      data.foto_url = form.foto; // OJO: debe llamarse foto_url
      data.descripcion = form.descripcion;
      data.ciudad = form.ciudad;
      data.comuna = form.comuna;
    }

    backendRegister(data);
  };

  // Opción registro sin pago (solo para psicólogos)
  const handleRegisterWithoutPay = () => {
    setMensaje("");
    setSubmitted(true);
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

  return (
    <div className="register-bg min-vh-100 d-flex flex-column align-items-center">
      <div className="register-card border rounded-4 shadow p-5 mt-5 bg-white" style={{ maxWidth: 520, width: "100%" }}>
        <h2 className="text-center text-primary fw-bold mb-4">Crea tu cuenta</h2>

        {/* Paso 1: Selección de tipo de usuario */}
        {!tipo && (
          <>
            <p className="text-center mb-4">¿Cómo quieres usar WebPsicologos?</p>
            <div className="d-flex justify-content-center gap-3">
              {opciones.map(opt => (
                <button
                  key={opt.value}
                  className="btn btn-outline-primary btn-lg"
                  onClick={() => setTipo(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Paso 2: Formulario según tipo */}
        {tipo && (
          <form className="mt-4" onSubmit={handleSubmit} noValidate>
            {/* Nombre */}
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                className="form-control"
                name="nombre"
                required
                onChange={handleChange}
                onBlur={handleBlur}
                value={form.nombre || ""}
              />
              {(submitted || touched.nombre) && isRequiredEmpty("nombre") && (
                <div className="text-danger mt-1" style={{ fontSize: "0.9em" }}>
                  Este campo es obligatorio
                </div>
              )}
            </div>
            {/* Apellido */}
            <div className="mb-3">
              <label className="form-label">Apellido</label>
              <input
                type="text"
                className="form-control"
                name="apellido"
                required
                onChange={handleChange}
                onBlur={handleBlur}
                value={form.apellido || ""}
              />
              {(submitted || touched.apellido) && isRequiredEmpty("apellido") && (
                <div className="text-danger mt-1" style={{ fontSize: "0.9em" }}>
                  Este campo es obligatorio
                </div>
              )}
            </div>

            {/* Campos solo para psicólogos */}
            {tipo === "psicologo" && (
              <>
                <div className="mb-3">
                  <label className="form-label">Universidad</label>
                  <input
                    type="text"
                    className="form-control"
                    name="universidad"
                    required
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={form.universidad || ""}
                  />
                  {(submitted || touched.universidad) && isRequiredEmpty("universidad") && (
                    <div className="text-danger mt-1" style={{ fontSize: "0.9em" }}>
                      Este campo es obligatorio
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Título profesional</label>
                  <input
                    type="text"
                    className="form-control"
                    name="titulo"
                    required
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={form.titulo || ""}
                  />
                  {(submitted || touched.titulo) && isRequiredEmpty("titulo") && (
                    <div className="text-danger mt-1" style={{ fontSize: "0.9em" }}>
                      Este campo es obligatorio
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Ciudad</label>
                  <input
                    type="text"
                    className="form-control"
                    name="ciudad"
                    required
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={form.ciudad || ""}
                  />
                  {(submitted || touched.ciudad) && isRequiredEmpty("ciudad") && (
                    <div className="text-danger mt-1" style={{ fontSize: "0.9em" }}>
                      Este campo es obligatorio
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Comuna</label>
                  <input
                    type="text"
                    className="form-control"
                    name="comuna"
                    required
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={form.comuna || ""}
                  />
                  {(submitted || touched.comuna) && isRequiredEmpty("comuna") && (
                    <div className="text-danger mt-1" style={{ fontSize: "0.9em" }}>
                      Este campo es obligatorio
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Foto (URL o archivo)</label>
                  <input
                    type="text"
                    className="form-control"
                    name="foto"
                    placeholder="URL o archivo (pronto)"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={form.foto || ""}
                  />
                  {(submitted || touched.foto) && isRequiredEmpty("foto") && (
                    <div className="text-danger mt-1" style={{ fontSize: "0.9em" }}>
                      Este campo es obligatorio
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Descripción breve</label>
                  <textarea
                    className="form-control"
                    name="descripcion"
                    rows={2}
                    required
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={form.descripcion || ""}
                  />
                  {(submitted || touched.descripcion) && isRequiredEmpty("descripcion") && (
                    <div className="text-danger mt-1" style={{ fontSize: "0.9em" }}>
                      Este campo es obligatorio
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Correo */}
            <div className="mb-3">
              <label className="form-label">Correo electrónico</label>
              <input
                type="email"
                className="form-control"
                name="correo"
                required
                onChange={handleChange}
                onBlur={handleBlur}
                value={form.correo || ""}
              />
              {(submitted || touched.correo) && isRequiredEmpty("correo") && (
                <div className="text-danger mt-1" style={{ fontSize: "0.9em" }}>
                  Este campo es obligatorio
                </div>
              )}
            </div>
            {/* Contraseña */}
            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control"
                name="password1"
                required
                onChange={handleChange}
                onBlur={handleBlur}
                value={form.password1 || ""}
              />
              {(submitted || touched.password1) && isRequiredEmpty("password1") && (
                <div className="text-danger mt-1" style={{ fontSize: "0.9em" }}>
                  Este campo es obligatorio
                </div>
              )}
            </div>
            {/* Repite contraseña */}
            <div className="mb-4">
              <label className="form-label">Repite la contraseña</label>
              <input
                type="password"
                className="form-control"
                name="password2"
                required
                onChange={handleChange}
                onBlur={handleBlur}
                value={form.password2 || ""}
              />
              {(submitted || touched.password2) && isRequiredEmpty("password2") && (
                <div className="text-danger mt-1" style={{ fontSize: "0.9em" }}>
                  Este campo es obligatorio
                </div>
              )}
              {(submitted || touched.password2) && form.password1 && form.password2 && form.password1 !== form.password2 && (
                <div className="text-danger mt-1" style={{ fontSize: "0.9em" }}>
                  Las contraseñas no coinciden
                </div>
              )}
            </div>

            {/* Opciones de pago SOLO para psicólogos */}
            {tipo === "psicologo" ? (
              <>
                <div className="alert alert-info">
                  <strong>¡Atención!</strong> Para activar tu perfil deberás realizar el pago de suscripción.
                </div>
                <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                  {loading ? "Registrando..." : "Pagar Ahora"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm w-100 mt-3"
                  onClick={handleRegisterWithoutPay}
                  disabled={loading}
                >
                  Registrarme sin pagar
                </button>
              </>
            ) : (
              <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                {loading ? "Registrando..." : "Registrarme"}
              </button>
            )}

            <div className="text-center mt-3">
              <button type="button" className="btn btn-link text-secondary" onClick={() => setTipo("")}>
                ← Volver
              </button>
            </div>
            {/* Mensaje de feedback */}
            {mensaje && (
              <div className={`alert mt-4 ${mensaje.startsWith("¡Registro exitoso") ? "alert-success" : "alert-danger"}`}>
                {mensaje}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
