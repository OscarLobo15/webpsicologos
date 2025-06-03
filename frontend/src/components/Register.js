import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const opciones = [
  { value: "psicologo", label: "Soy Psicólogo/a" },
  { value: "paciente", label: "Busco Psicólogo/a" }
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
};

export default function Register() {
  const [tipo, setTipo] = useState("");
  const [form, setForm] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
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

  const handleSubmit = e => {
    e.preventDefault();
    setSubmitted(true);

    if (!isFormValid) return;

    alert("¡Registro enviado! (Aquí deberías conectar con tu backend)");

    // Si es paciente, redirige a /search
    if (tipo === "paciente") {
      navigate("/search");
    }
    // Si es psicólogo, puedes redirigir a otra vista si lo deseas
  };

  const handleRegisterWithoutPay = () => {
    setSubmitted(true);
    if (!isFormValid) return;
    alert("Registro sin pago enviado (prueba)");
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
                <button className="btn btn-primary w-100" type="submit">
                  Pagar Ahora
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm w-100 mt-3"
                  onClick={handleRegisterWithoutPay}
                >
                  Registrarme sin pagar
                </button>
              </>
            ) : (
              <button className="btn btn-primary w-100" type="submit">
                Registrarme
              </button>
            )}

            <div className="text-center mt-3">
              <button type="button" className="btn btn-link text-secondary" onClick={() => setTipo("")}>
                ← Volver
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
