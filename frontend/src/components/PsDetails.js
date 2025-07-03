import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function PsDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [psicologo, setPsicologo] = useState(null);
  const [proximaHora, setProximaHora] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPsicologo = async () => {
      setLoading(true);
      try {
        const resp = await fetch(`http://localhost:5000/api/psychologists/${id}`);
        const data = await resp.json();
        if (data.success) {
          setPsicologo(data.psicologo);
        } else {
          setPsicologo(null);
        }
      } catch {
        setPsicologo(null);
      }
      setLoading(false);
    };

    const getProximaHora = async () => {
      try {
        const resp = await fetch(`http://localhost:5000/api/horarios/psicologo/${id}`);
        const data = await resp.json();
        if (data.success) {
          const disponibles = data.data.filter(h => h.disponible);
          if (disponibles.length > 0) {
            disponibles.sort((a, b) => new Date(`${a.fecha}T${a.hora}`) - new Date(`${b.fecha}T${b.hora}`));
            setProximaHora(disponibles[0]);
          }
        }
      } catch {
        setProximaHora(null);
      }
    };

    getPsicologo();
    getProximaHora();
  }, [id]);

  if (loading) return <div className="text-center mt-5">Cargando psicólogo...</div>;
  if (!psicologo) return <div className="text-center mt-5">Psicólogo no encontrado</div>;

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <nav className="navbar navbar-expand-lg custom-navbar shadow-sm px-4">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="Logo" style={{ width: 44, height: 44, marginRight: 10 }} />
            <span className="navbar-brand mb-0 h1 fs-4 fw-bold text-light">WebPsicologos</span>
          </div>
          <button className="btn btn-outline-light" onClick={() => navigate("/login")}>Iniciar sesión</button>
        </div>
      </nav>

      <div className="container py-5 flex-grow-1">
        <div className="d-flex justify-content-start mb-3">
          <button className="btn btn-outline-secondary" onClick={() => navigate("/search")}>
            ← Volver al buscador
          </button>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="bg-white shadow rounded-4 p-4">
              <div className="row align-items-start mb-4">
                <div className="col-md-3 text-center">
                  <img
                    src={psicologo?.foto_url || 'https://via.placeholder.com/140'}
                    alt="perfil"
                    className="rounded-circle"
                    style={{ width: 140, height: 140, objectFit: 'cover' }}
                  />
                  <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
                    {proximaHora ? (
                      <div
                        className="text-success fw-semibold"
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/reservar/${psicologo.usuario_id}`)}
                        title="Haz clic para reservar"
                      >
                        🟢 <strong>Próxima hora:</strong>{" "}
                        {new Date(`${proximaHora.fecha}T${proximaHora.hora}`).toLocaleString("es-CL", {
                          weekday: "long",
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    ) : (
                      <div className="text-muted">No hay horas disponibles</div>
                    )}
                  </div>
                </div>
                <div className="col-md-9">
                  <h2 className="fw-bold">{psicologo?.nombre} {psicologo?.apellido}, Psicólogo/a Clínico/a</h2>
                  <p className="text-muted mb-1">{psicologo?.universidad || 'Falta info en BD'}</p>
                  <p><strong>Especialización:</strong> {psicologo?.descripcion || 'Falta info en BD'}</p>
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-md-4">
                  <div className="bg-light p-3 rounded-3 h-100">
                    <h5 className="fw-semibold mb-3">Áreas de atención</h5>
                    <div className="d-flex flex-wrap gap-2">
                      {(psicologo?.areas || ["Falta info en BD"]).map((area, i) => (
                        <span key={i} className="badge bg-primary-subtle text-primary fw-semibold border border-primary-subtle px-3 py-2">{area}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="col-md-8">
                  <div className="bg-light p-3 rounded-3">
                    <h5 className="fw-semibold mb-3">Enfoque terapéutico</h5>
                    <p>{psicologo?.enfoque || "Falta info en BD"}</p>
                  </div>
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="bg-light p-3 rounded-3">
                    <h5 className="fw-semibold mb-2">Formación académica</h5>
                    <ul className="mb-0">
                      {(psicologo?.formacion || ["Falta info en BD"]).map((f, i) => (<li key={i}>{f}</li>))}
                    </ul>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="bg-light p-3 rounded-3">
                    <h5 className="fw-semibold mb-2">Experiencia profesional</h5>
                    <p>{psicologo?.experiencia || "Falta info en BD"}</p>
                  </div>
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="bg-light p-3 rounded-3">
                    <h5 className="fw-semibold">Idiomas</h5>
                    <p>{psicologo?.idiomas || "Falta info en BD"}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="bg-light p-3 rounded-3">
                    <h5 className="fw-semibold">Tarifas y formas de pago</h5>
                    <p>{psicologo?.tarifas || "Falta info en BD"}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h5 className="fw-semibold mb-3">Opiniones de pacientes</h5>
                {(psicologo?.opiniones || ["Falta info en BD"]).map((op, i) => (
                  <blockquote key={i} className="blockquote border-start border-4 ps-3 mb-3">
                    <p className="mb-1">“{op}”</p>
                    <footer className="blockquote-footer">Paciente anónimo</footer>
                  </blockquote>
                ))}
              </div>

              <div className="mb-4">
                <h5 className="fw-semibold mb-3">Preguntas frecuentes</h5>
                <div className="accordion" id="faq">
                  <div className="accordion-item">
                    <h2 className="accordion-header" id="faq1">
                      <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse1">
                        ¿Cuánto dura una sesión?
                      </button>
                    </h2>
                    <div id="collapse1" className="accordion-collapse collapse show" data-bs-parent="#faq">
                      <div className="accordion-body">Cada sesión dura entre 45 y 60 minutos.</div>
                    </div>
                  </div>
                  <div className="accordion-item">
                    <h2 className="accordion-header" id="faq2">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse2">
                        ¿Se entregan boletas?
                      </button>
                    </h2>
                    <div id="collapse2" className="accordion-collapse collapse" data-bs-parent="#faq">
                      <div className="accordion-body">Sí, todas las sesiones incluyen boleta reembolsable.</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-between mt-4">
                <button className="btn btn-outline-secondary" onClick={() => navigate("/search")}>
                  ← Volver al buscador
                </button>
                <button className="btn btn-primary" onClick={() => navigate(`/reservar/${psicologo.usuario_id}`)}>
                  Reservar sesión →
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
