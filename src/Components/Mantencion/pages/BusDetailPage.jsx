import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarAdmin from "../../Sidebar/SidebarAdmin";

import { useMantenimientos } from "../hooks/useMantenimientos";
import CrearMantenimientoModal from "../components/CrearMantenimientoModal";
import HistorialMantenimientos from "../components/HistorialMantenimientos";

export default function BusDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 🔐 Auth
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // 📊 Data
  const { mantenimientos, loading, refresh } = useMantenimientos(id);

  // 📌 UI
  const [open, setOpen] = useState(false);

  // 📌 Sidebar
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  // 🔐 Validar token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="bg-gray-300 min-h-screen flex">
      {/* SIDEBAR */}
      <SidebarAdmin isOpen={isOpen} toggleSidebar={toggleSidebar} />

      {/* CONTENIDO */}
      <main
        className={`flex-1 bg-green-300 p-4 sm:p-6 transition-all duration-300 ${
          isOpen ? "ml-48" : "ml-20"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="relative mb-6 flex flex-col items-center min-h-24 justify-center">
            <p className="text-lime-900 font-bold text-2xl sm:text-3xl text-center italic">
              Detalle del Bus
            </p>
            <div className="flex flex-col gap-2 sm:absolute sm:right-0 sm:top-0 sm:py-2">
              {/* BOTONES */}
              <button
                onClick={() => navigate("/mantencion")}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-900"
              >
                ← Volver
              </button>

              <button
                onClick={() => setOpen(true)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-900"
              >
                Ingresar a Taller
              </button>
            </div>
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <p className="text-lime-900 text-sm italic mt-4 font-bold">
            Cargando mantenimientos...
          </p>
        ) : (
          <HistorialMantenimientos data={mantenimientos} />
        )}

        {/* MODAL */}
        {open && (
          <CrearMantenimientoModal
            busId={id}
            onClose={() => setOpen(false)}
            onSuccess={refresh}
          />
        )}
      </main>
    </div>
  );
}
