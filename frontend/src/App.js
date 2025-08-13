// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
