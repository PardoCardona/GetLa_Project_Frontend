import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarAdmin from "../Sidebar/SidebarAdmin";

const Mantencion = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Estado del sidebar
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  useEffect(() => {
    const autenticarUsuario = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthenticated(false);
        navigate("/");
      }
    };
    autenticarUsuario();
  }, [navigate]);

  return (
    <div className="bg-gray-100 min-h-screen flex">
      {/* SIDEBAR */}
      <SidebarAdmin isOpen={isOpen} toggleSidebar={toggleSidebar} />

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-6">
        <h1 className="text-black text-center text-xl font-extrabold tracking-widest">
          Bienvenido al Área de Mantención
        </h1>
      </main>
    </div>
  );
};

export default Mantencion;
