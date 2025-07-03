import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

const logoURL = "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg";

const testimonios = [
  { nombre: "María P.", texto: "Encontré a mi psicóloga ideal en minutos. El sitio es hermoso, rápido y seguro." },
  { nombre: "Camilo V.", texto: "La atención que recibí fue excelente. Muy fácil de encontrar a alguien que me entendiera." },
];

export default function LandingPageUsuarios() {
  return (
    <div className="min-vh-100 d-flex flex-column bg-white">
      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg custom-navbar shadow-sm px-4">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <img src={logoURL} alt="Logo" style={{ width: 48, height: 48, marginRight: 12 }} />
            <span className="navbar-brand mb-0 h1 fs-4 fw-bold text-light">WebPsicologos</span>
          </div>
          <div className="ms-auto d-flex align-items-center gap-2">
            <Link to="/login" className="text-white text-decoration-none small">Iniciar sesión</Link>
            <Link to="/psychologists-landing" className="btn btn-outline-light btn-sm">¿Eres psicólogo?</Link>
          </div>
        </div>
      </nav>

      {/* HERO SECCIÓN LLAMATIVA CON FONDO */}
      <section
        className="text-white text-center d-flex flex-column justify-content-center align-items-center hero-section px-3"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1588776814546-ec7c72a18727?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '60vh',
          position: 'relative',
        }}
      >
        <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: '2rem', borderRadius: '0.5rem' }}>
          <h1 className="display-4 fw-bold mb-3">Conecta con psicólogos de confianza</h1>
          <p className="lead mb-4">Agenda una sesión online o presencial con profesionales certificados en pocos pasos.</p>
          <Link to="/search" className="btn btn-success btn-lg px-4">Comenzar ahora</Link>
        </div>
      </section>

      {/* BENEFICIOS DESTACADOS */}
      <section className="py-5">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-4 mb-4">
              <i className="bi bi-patch-check fs-1 text-primary"></i>
              <h5 className="mt-3">Verificación profesional</h5>
              <p className="text-muted">Cada psicólogo pasa por un proceso de validación y revisión de credenciales.</p>
            </div>
            <div className="col-md-4 mb-4">
              <i className="bi bi-people fs-1 text-primary"></i>
              <h5 className="mt-3">Atención personalizada</h5>
              <p className="text-muted">Te ayudamos a encontrar el profesional más adecuado para tus necesidades.</p>
            </div>
            <div className="col-md-4 mb-4">
              <i className="bi bi-shield-lock fs-1 text-primary"></i>
              <h5 className="mt-3">Privacidad garantizada</h5>
              <p className="text-muted">Tus datos y sesiones están protegidos bajo estrictos estándares de seguridad.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS VISUALES */}
      <section className="bg-light py-5">
        <div className="container">
          <h3 className="text-center mb-4">Lo que opinan nuestros usuarios</h3>
          <div className="row justify-content-center">
            {testimonios.map((t, i) => (
              <div className="col-md-5 mb-3" key={i}>
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-body">
                    <p className="fst-italic">“{t.texto}”</p>
                    <p className="fw-bold mb-0 text-end">{t.nombre}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="text-center bg-primary text-white py-5">
        <h4 className="mb-3">¿Listo para comenzar tu proceso?</h4>
        <Link to="/search" className="btn btn-light px-4">Buscar psicólogo</Link>
      </section>

      {/* FOOTER */}
      <footer className="bg-white text-secondary text-center py-3 border-top mt-auto">
        © 2025 WebPsicologos — Todos los derechos reservados
      </footer>
    </div>
  );
}

