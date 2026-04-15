import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarAdmin from "../../Sidebar/SidebarAdmin";

import { useBuses } from "../hooks/useBuses";
import BusCard from "../components/BusCard";
import { createBus } from "../services/mantencionService";
import { FiPlusCircle } from "react-icons/fi";

export default function BusesPage() {
  const navigate = useNavigate();

  // 🔐 Auth
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // 📊 Data
  const { buses, loading, refresh } = useBuses();

  // 📌 Sidebar
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  // 🆕 Modal
  const [openModal, setOpenModal] = useState(false);

  // 📝 Formulario
  const [form, setForm] = useState({
    imagen: "",
    numeroInterno: "",
    placa: "",
    marca: "",
    modelo: "",
    anio: "",
  });

  // 🔐 Validar token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      navigate("/");
    }
  }, [navigate]);

  // 🆕 Crear bus
  const handleCreateBus = async () => {
    if (!form.imagen || !form.numeroInterno || !form.placa) {
      alert("Imagen, Número Interno y Placa son obligatorios");
      return;
    }

    if (form.anio && form.anio < 1900) {
      alert("El año no es válido");
      return;
    }

    try {
      await createBus({
        imagen: form.imagen,
        numeroInterno: form.numeroInterno,
        placa: form.placa,
        marca: form.marca,
        modelo: form.modelo,
        anio: form.anio ? Number(form.anio) : undefined, // ✅ FIX PRO
      });

      setOpenModal(false);

      setForm({
        imagen: "",
        numeroInterno: "",
        placa: "",
        marca: "",
        modelo: "",
        anio: "",
      });

      refresh();
    } catch (error) {
      console.error(error);
      alert("Error creando bus");
    }
  };

  // 🔐 Bloqueo si no está autenticado
  if (!isAuthenticated) return null;

  // ⏳ Loading
  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen flex">
        <SidebarAdmin isOpen={isOpen} toggleSidebar={toggleSidebar} />
        <main className="flex-1 p-6">
          <p>Cargando buses...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen flex">
      {/* SIDEBAR */}
      <SidebarAdmin isOpen={isOpen} toggleSidebar={toggleSidebar} />

      {/* CONTENIDO */}
      <main
        className={`flex-1 bg-green-300 p-2 sm:p-6 transition-all duration-300 ${
          isOpen ? "ml-48" : "ml-20"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          {/* HEADER */}
          <div className="mb-6 grid grid-cols-3 items-center">
            <div></div>

            <p className="text-lime-900 font-bold text-2xl sm:text-3xl italic text-center">
              Flota de Buses
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => setOpenModal(true)}
                className="w-auto flex items-center justify-center gap-2 whitespace-nowrap text-green-800 text-sm sm:text-base cursor-pointer bg-green-400 px-4 py-2 rounded-2xl hover:bg-green-600"
              >
                <FiPlusCircle className="text-lg sm:text-2xl" />
                <span className="font-semibold">Crear Bus</span>
              </button>
            </div>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
            {buses.length === 0 ? (
              <p className="col-span-full text-center text-gray-700">
                No hay buses registrados.
              </p>
            ) : (
              buses.map((bus) => (
                <BusCard
                  key={bus._id}
                  bus={bus}
                  onClick={() => navigate(`/mantencion/${bus._id}`)}
                />
              ))
            )}
          </div>
        </div>

        {/* MODAL */}
        {openModal && (
          <div
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 text-black"
            onClick={() => setOpenModal(false)} // ✅ cerrar al hacer click afuera
          >
            <div
              className="bg-green-200 p-6 rounded-xl shadow-lg w-[400px]"
              onClick={(e) => e.stopPropagation()} // ✅ evitar cierre interno
            >
              <p className="text-lime-900 font-bold text-xl sm:text-2xl text-center mb-3 italic">
                Crear Bus
              </p>

              <label className="uppercase text-gray-600 block text-[10px] font-bold">
                Imagen del Bus
              </label>
              <input
                className="w-full mt-1 p-1.5 border rounded-lg bg-gray-50 text-black text-xs"
                placeholder="URL de Cloudinary"
                value={form.imagen}
                onChange={(e) => setForm({ ...form, imagen: e.target.value })}
              />

              <label className="uppercase text-gray-600 block text-[10px] font-bold mt-1">
                Número Interno del Bus
              </label>
              <input
                className="w-full mt-1 p-1.5 border rounded-lg bg-gray-50 text-black text-xs"
                placeholder="Número Interno del Bus"
                value={form.numeroInterno}
                onChange={(e) =>
                  setForm({ ...form, numeroInterno: e.target.value })
                }
              />

              <label className="uppercase text-gray-600 block text-[10px] font-bold mt-1">
                Placa del bus
              </label>
              <input
                className="w-full mt-1 p-1.5 border rounded-lg bg-gray-50 text-black text-xs"
                placeholder="Placa del Bus"
                value={form.placa}
                onChange={(e) => setForm({ ...form, placa: e.target.value })}
              />

              <label className="uppercase text-gray-600 block text-[10px] font-bold mt-1">
                Marca del Bus
              </label>
              <input
                className="w-full mt-1 p-1.5 border rounded-lg bg-gray-50 text-black text-xs"
                placeholder="Marca del Bus"
                value={form.marca}
                onChange={(e) => setForm({ ...form, marca: e.target.value })}
              />

              <label className="uppercase text-gray-600 block text-[10px] font-bold mt-1">
                Modelo del Bus
              </label>
              <input
                className="w-full mt-1 p-1.5 border rounded-lg bg-gray-50 text-black text-xs"
                placeholder="Modelo del Bus"
                value={form.modelo}
                onChange={(e) => setForm({ ...form, modelo: e.target.value })}
              />

              <label className="uppercase text-gray-600 block text-[10px] font-bold mt-1">
                Año
              </label>
              <input
                className="w-full mt-1 p-1.5 border rounded-lg bg-gray-50 text-black text-xs"
                placeholder="Año"
                type="number"
                value={form.anio}
                onChange={(e) => setForm({ ...form, anio: e.target.value })}
              />

              <div className="flex justify-between mt-4">
                <button
                  onClick={handleCreateBus}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-800"
                >
                  Guardar
                </button>

                <button
                  onClick={() => setOpenModal(false)}
                  className="bg-red-400 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
