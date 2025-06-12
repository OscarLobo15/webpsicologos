import React from "react";
import { useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --------- NAVBAR DEL DASHBOARD (IGUAL QUE SEARCH PERO SIN FILTROS) ---------
function DashboardNavbar() {
  const navigate = useNavigate();
  const isLogged = !!localStorage.getItem("token");
  let usuarioInfo = null;
  if (isLogged) {
    try {
      usuarioInfo = JSON.parse(localStorage.getItem("user"));
    } catch {
      usuarioInfo = null;
    }
  }

  return (
    <nav className="navbar navbar-expand-lg custom-navbar shadow-sm px-4">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg"
            alt="Logo"
            style={{ width: 44, height: 44, marginRight: 10 }}
          />
          <span className="navbar-brand mb-0 h1 fs-4 fw-bold text-light">
            WebPsicologos
          </span>
        </div>
        <div className="d-flex align-items-center">
          {isLogged && (
            <>
              <div
                className="bg-secondary rounded-circle d-flex align-items-center justify-content-center me-3"
                style={{ width: 42, height: 42, cursor: "pointer" }}
                title="Cuenta"
                onClick={() => navigate("/profile")}
              >
                {usuarioInfo && usuarioInfo.foto_url ? (
                  <img
                    src={usuarioInfo.foto_url}
                    alt="perfil"
                    className="rounded-circle"
                    style={{ width: 40, height: 40, objectFit: "cover" }}
                  />
                ) : (
                  <i className="bi bi-person fs-3 text-white" />
                )}
              </div>
              <button
                className="btn btn-link text-white fs-4 p-0"
                style={{ marginLeft: 10 }}
                title="Cerrar sesión"
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  navigate("/");
                }}
              >
                <i className="bi bi-box-arrow-right"></i>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// ----------- MOCK DATA (puedes conectar luego a backend) -----------
const pacientesDelDia = [
  { nombre: "Juan Pérez", hora: "09:00" },
  { nombre: "Ana Soto", hora: "11:30" },
  { nombre: "María Gómez", hora: "15:00" },
];

const pacientesPorDia = {
  labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
  data: [4, 3, 5, 2, 6, 0, 0]
};

const pacientesMensuales = 37;
const horasSemana = 14.5;

// -------- DASHBOARD --------
export default function DashboardPs() {
  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <DashboardNavbar />

      <div className="container mb-5 mt-3">
        {/* LISTADO DE PACIENTES DEL DÍA Y GRÁFICO */}
        <div className="row g-4">
          {/* Listado de pacientes del día */}
          <div className="col-12 col-lg-6">
            <div className="card h-100 shadow-sm">
              <div className="card-header bg-primary text-white fw-bold">
                Pacientes del día
              </div>
              <div className="card-body">
                {pacientesDelDia.length === 0 ? (
                  <div className="text-muted">No tienes pacientes agendados para hoy.</div>
                ) : (
                  <ul className="list-group list-group-flush">
                    {pacientesDelDia.map((p, i) => (
                      <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>{p.nombre}</span>
                        <span className="badge bg-secondary">{p.hora}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          {/* Gráfico de pacientes diarios */}
          <div className="col-12 col-lg-6">
            <div className="card h-100 shadow-sm">
              <div className="card-header bg-primary text-white fw-bold">
                Pacientes diarios (semana)
              </div>
              <div className="card-body">
                <Bar
                  data={{
                    labels: pacientesPorDia.labels,
                    datasets: [
                      {
                        label: "Cantidad de pacientes",
                        data: pacientesPorDia.data,
                        backgroundColor: "rgba(54,162,235,0.7)",
                        borderRadius: 6,
                      },
                    ],
                  }}
                  options={{
                    plugins: {
                      legend: { display: false },
                    },
                    scales: {
                      y: { beginAtZero: true, ticks: { stepSize: 1 } }
                    },
                  }}
                  height={170}
                />
              </div>
            </div>
          </div>
        </div>

        {/* DATOS DE PACIENTES MENSUALES Y HORAS SEMANA */}
        <div className="row mt-4 g-4">
          <div className="col-12 col-md-6">
            <div className="card shadow-sm">
              <div className="card-body d-flex flex-column align-items-center">
                <h6 className="mb-2 text-muted">Pacientes mensuales</h6>
                <div className="display-4 fw-bold text-primary">{pacientesMensuales}</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="card shadow-sm">
              <div className="card-body d-flex flex-column align-items-center">
                <h6 className="mb-2 text-muted">Horas trabajadas (semana actual)</h6>
                <div className="display-4 fw-bold text-primary">{horasSemana}</div>
                <span className="text-muted">horas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
