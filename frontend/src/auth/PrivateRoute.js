import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

export default function PrivateRoute({ children, allowedRoles = [] }) {
  const [loading, setLoading] = useState(true);
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    const verificarSesion = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userLocal = JSON.parse(localStorage.getItem("user"));

      if (sessionData.session && userLocal) {
        if (
          allowedRoles.length === 0 || 
          allowedRoles.includes(userLocal.tipo_usuario)
        ) {
          setAutorizado(true);
        }
      }

      setLoading(false);
    };

    verificarSesion();
  }, [allowedRoles]);

  if (loading) {
    return <div className="text-center py-10 text-blue-500">Cargando sesión...</div>;
  }

  return autorizado ? children : <Navigate to="/login" />;
}
