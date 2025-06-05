import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }
      try {
        // Verifica el token con el backend usando un endpoint privado (por ejemplo: /api/profile)
        const resp = await fetch("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resp.ok) {
          // Si el backend responde 401 o cualquier error, forzamos logout y redirigimos
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          setChecking(false);
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    };
    checkToken();
  }, [navigate]);

  if (checking) return <div>Cargando...</div>;
  return children;
}
