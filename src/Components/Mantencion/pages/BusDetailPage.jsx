import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarAdmin from "../../Sidebar/SidebarAdmin";

import { getBusById } from "../services/mantencionService";
import { useMantenimientos } from "../hooks/useMantenimientos";
import CrearMantenimientoModal from "../components/CrearMantenimientoModal";
import HistorialMantenimientos from "../components/HistorialMantenimientos";

export default function BusDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bus, setBus] = useState(null);
  const [loadingBus, setLoadingBus] = useState(true);

  const { mantenimientos, loading, refresh } = useMantenimientos(id);

  const [open, setOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  // Validar token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, [navigate]);

  // Cargar datos del bus
  useEffect(() => {
    if (!id) return;
    const fetchBus = async () => {
      try {
        const data = await getBusById(id);
        setBus(data?.error ? null : data);
      } catch {
        setBus(null);
      } finally {
        setLoadingBus(false);
      }
    };
    fetchBus();
  }, [id]);

  // Badge de estado del bus
  const getEstadoBus = () => {
    if (!bus) return null;
    if (bus.estado === "en_taller")
      return (
        <span className="bg-yellow-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
          🟡 En Taller
        </span>
      );
    return (
      <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
        🟢 Activo
      </span>
    );
  };

  return (
    <div className="bg-gray-300 min-h-screen flex">
      <SidebarAdmin isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <main
        className={`flex-1 bg-green-300 p-4 sm:p-6 transition-all duration-300 ${
          isOpen ? "ml-48" : "ml-20"
        }`}
      >
        <div className="max-w-5xl mx-auto">
          {/* ── TARJETA DEL BUS ───────────────────────── */}
          {loadingBus ? (
            <p className="text-lime-900 font-bold italic animate-pulse text-center py-6">
              Cargando datos del bus...
            </p>
          ) : bus ? (
            <div className="bg-green-200 rounded-2xl shadow-md p-5 mb-6 flex flex-col sm:flex-row gap-5 items-center sm:items-start">
              {/* Imagen */}
              <img
                src={bus.imagen || "https://via.placeholder.com/150?text=Bus"}
                alt={bus.numeroInterno}
                className="w-40 h-32 object-contain rounded-xl bg-green-200 border border-green-300"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/150?text=Sin+imagen";
                }}
              />

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <p className="text-lime-900 font-bold text-2xl italic">
                    {bus.numeroInterno}
                  </p>
                  {getEstadoBus()}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-sm text-gray-800">
                  <p>
                    <strong>Placa:</strong> {bus.placa || "—"}
                  </p>
                  <p>
                    <strong>Marca:</strong> {bus.marca || "—"}
                  </p>
                  <p>
                    <strong>Modelo:</strong> {bus.modelo || "—"}
                  </p>
                  <p>
                    <strong>Año:</strong> {bus.anio || "—"}
                  </p>
                  <p>
                    <strong>Mantenimientos:</strong> {mantenimientos.length}
                  </p>
                </div>
              </div>

              {/* Botones */}
              <div className="flex flex-col gap-2 sm:items-end">
                <button
                  onClick={() => navigate("/mantencion")}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-semibold"
                >
                  ← Volver
                </button>
                <button
                  onClick={() => setOpen(true)}
                  disabled={bus.estado === "en_taller"}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-900 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  title={
                    bus.estado === "en_taller" ? "El bus ya está en taller" : ""
                  }
                >
                  🔧 Ingresar a Taller
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-red-100 border border-red-300 text-red-700 rounded-xl p-4 mb-6 text-center">
              No se encontró el bus.{" "}
              <button
                onClick={() => navigate("/mantencion")}
                className="underline font-semibold"
              >
                Volver
              </button>
            </div>
          )}

          {/* ── HISTORIAL ─────────────────────────────── */}
          {loading ? (
            <p className="text-lime-900 text-sm italic font-bold animate-pulse">
              Cargando historial...
            </p>
          ) : (
            <HistorialMantenimientos
              data={mantenimientos}
              onRefresh={refresh}
            />
          )}
        </div>

        {/* MODAL CREAR MANTENIMIENTO */}
        {open && (
          <CrearMantenimientoModal
            busId={id}
            busEstado={bus?.estado}
            onClose={() => setOpen(false)}
            onSuccess={() => {
              refresh();
              // Recargar bus para actualizar el estado en_taller
              getBusById(id).then((data) => {
                if (!data?.error) setBus(data);
              });
            }}
          />
        )}
      </main>
    </div>
  );
}
