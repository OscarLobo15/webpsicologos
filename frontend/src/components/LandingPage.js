import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

const logoURL = "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg";

const comentarios = [
  { nombre: "María P.", texto: "¡Encontré a mi psicóloga ideal en minutos! El sitio es fácil de usar y totalmente seguro." },
  { nombre: "Dr. Carlos Ruiz", texto: "Como profesional, puedo gestionar mis pacientes y agenda de manera muy eficiente. Recomiendo la plataforma." },
  { nombre: "Javier L.", texto: "La privacidad y rapidez del sistema me sorprendieron. Ahora agendar una sesión es simple." },
];

export default function LandingPage() {
  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* NAVBAR MÁS OSCURA */}
      <nav className="navbar navbar-expand-lg custom-navbar shadow-sm px-4">
        <div className="container-fluid">
          <div className="d-flex align-items-center">
            <img src={logoURL} alt="Logo" style={{ width: 48, height: 48, marginRight: 12 }} />
            <span className="navbar-brand mb-0 h1 fs-4 fw-bold">WebPsicologos</span>
          </div>
          <div>
            <Link to="/register" className="btn btn-outline-light me-2">Crear cuenta</Link>
            <Link to="/login" className="btn btn-light text-dark">Iniciar sesión</Link>
          </div>
        </div>
      </nav>

      {/* CUERPO CENTRAL MEJORADO */}
      <main className="flex-grow-1 d-flex justify-content-center align-items-start bg-white">
        <div className="w-100 d-flex justify-content-center">
          <div className="info-rect">
            <h2 className="text-center text-primary fw-bold mb-3">¿Por qué WebPsicologos?</h2>
            <p className="text-secondary mb-4 text-center fs-5">
              Nuestra plataforma conecta psicólogos certificados con personas que buscan apoyo emocional.<br /><br />
              <span className="fw-bold text-primary">¿Eres psicólogo?</span> Gestiona tu agenda, amplía tu red y ofrece tus servicios de manera segura.<br />
              <span className="fw-bold text-primary">¿Buscas ayuda?</span> Encuentra al profesional ideal, agenda sesiones fácilmente y mantén tu privacidad protegida.
            </p>
            <div className="d-flex justify-content-center gap-3 mb-3">
              <Link to="/search" className="btn btn-success btn-lg me-3">Buscar psicólogo</Link>
              <Link to="/register" className="btn btn-outline-primary btn-lg">Suscribirme</Link>
            </div>
          </div>
        </div>
      </main>

      {/* SECCIÓN DE COMENTARIOS */}
      <section className="testimonios-section">
        <h3 className="text-center testimonios-title">Testimonios</h3>
        <div className="container">
          <div className="row justify-content-center">
            {comentarios.map((comentario, idx) => (
              <div key={idx} className="col-md-4 mb-3">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-body">
                    <blockquote className="blockquote mb-2">
                      <p className="mb-0 fst-italic">“{comentario.texto}”</p>
                    </blockquote>
                    <footer className="blockquote-footer text-end mt-2">
                      {comentario.nombre}
                    </footer>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-light text-secondary text-center py-3 border-top mt-auto">
        © 2025 WebPsicologos — Todos los derechos reservados
      </footer>
    </div>
  );
}
