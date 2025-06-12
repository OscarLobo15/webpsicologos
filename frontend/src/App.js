import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Register from "./components/Register";
import Login from "./components/LogIn";
import Search from "./components/Search";
import Profile from "./components/Profile";
import PsDetails from "./components/PsDetails";
import UpdateData from "./components/UpdateData";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPs from "./components/DashboardPs"; 

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

        {/* Rutas protegidas */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/update"
          element={
            <ProtectedRoute>
              <UpdateData />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard-psicologo"
          element={
            <ProtectedRoute>
              <DashboardPs />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
