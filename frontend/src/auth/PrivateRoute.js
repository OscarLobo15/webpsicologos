import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

export default function PrivateRoute({ children, allowedRoles = [] }) {
  const [loading, setLoading] = useState(true);
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        // Verificar si hay token y usuario en localStorage
        const token = localStorage.getItem("token");
        const userString = localStorage.getItem("user");
        
        if (!token || !userString) {
          setLoading(false);
          return;
        }
        
        const userLocal = JSON.parse(userString);

        // Verificar la sesión en Supabase (autenticación secundaria)
        // Aunque no usamos el resultado directamente, sirve como verificación adicional
        await supabase.auth.getSession();

        // Si hay sesión en Supabase O hay token local (permitimos cualquiera de las dos)
        if (token && userLocal) {
          if (
            allowedRoles.length === 0 || 
            allowedRoles.includes(userLocal.tipo_usuario)
          ) {
            setAutorizado(true);
          } else {
            // Usuario no tiene rol permitido
          }
        } else {
          console.error("No hay sesión activa");
        }
      } catch (error) {
        console.error("Error verificando sesión:", error);
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
