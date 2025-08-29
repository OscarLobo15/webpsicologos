import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const cerrarSesion = async () => {
      await supabase.auth.signOut();
      localStorage.removeItem("user");
      navigate("/login");
    };
    cerrarSesion();
  }, [navigate]);

  return <div className="text-center py-10">Cerrando sesión...</div>;
}
