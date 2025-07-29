// src/Components/HeaderDashboard.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../auth/useAuth";

export default function HeaderDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("user");
    navigate("/psicoconecta");
  };

  // Auto logout tras 5 min de inactividad
  useEffect(() => {
    const tiempoMaximo = 5 * 60 * 1000;
    let timeout = setTimeout(cerrarSesion, tiempoMaximo);

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(cerrarSesion, tiempoMaximo);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("scroll", resetTimer);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("scroll", resetTimer);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md px-6 py-4 flex justify-between items-center z-50">
      <h1
        className="text-xl font-bold text-blue-700 cursor-pointer"
        onClick={() => navigate("/dashboard-psicologo")}
      >
        PsicoConecta
      </h1>
      <div className="flex items-center gap-4">
        <span className="text-blue-800 font-semibold hidden sm:inline">
          Bienvenido, {user?.user_metadata?.nombre || user?.email}
        </span>
        <button
          onClick={() => navigate("/perfil")}
          className="hover:text-blue-700"
          title="Perfil"
        >
          <User className="w-6 h-6" />
        </button>
        <button
          onClick={cerrarSesion}
          className="hover:text-red-600"
          title="Cerrar sesión"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}
