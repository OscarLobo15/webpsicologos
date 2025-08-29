// src/App.js
import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPagePs";
import Register from "./auth/Register";
import Login from "./auth/Login";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import PsDetails from "./pages/PsDetails";
import UpdateData from "./pages/UpdateData";
import DashboardPs from "./pages/DashboardPs";
import ReservarHora from "./pages/ReservarHora";
import PsychologistLandingPage from "./pages/PsychologistLandingPage";
import PrivateRoute from "./auth/PrivateRoute";
import MiPerfil from "./pages/MiPerfil";

// Cargar EditarPerfil de manera asíncrona con React.lazy
const EditarPerfil = React.lazy(() => import('./pages/EditarPerfil'));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/search" element={<Search />} />
        <Route path="/psychologist/:id" element={<PsDetails />} />
        <Route path="/reservar/:id" element={<ReservarHora />} />
        <Route path="/psicoconecta" element={<PsychologistLandingPage />} />

        {/* Rutas protegidas */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/update"
          element={
            <PrivateRoute>
              <UpdateData />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard-psicologo"
          element={
            <PrivateRoute allowedRoles={["psicologo"]}>
              <DashboardPs />
            </PrivateRoute>
          }
        />
        <Route
          path="/mi-perfil"
          element={
            <PrivateRoute allowedRoles={["psicologo"]}>
              <MiPerfil />
            </PrivateRoute>
          }
        />
        {/* Redirigir /editar-perfil a /mi-perfil ya que ahora la edición está integrada */}
        <Route
          path="/editar-perfil"
          element={
            <PrivateRoute allowedRoles={["psicologo"]}>
              <Navigate to="/mi-perfil" replace />
            </PrivateRoute>
          }
        />
        <Route
          path="/crear-perfil"
          element={
            <PrivateRoute>
              <Suspense fallback={<div>Cargando...</div>}>
                {React.createElement(require('./pages/CrearPerfilPsicologo').default)}
              </Suspense>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
