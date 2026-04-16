import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarAdmin from "../../Sidebar/SidebarAdmin";
import { ESTADOS_BUS } from "../utils/constants";

import { useBuses } from "../hooks/useBuses";
import BusCard from "../components/BusCard";
import { createBus, updateBus, deleteBus } from "../services/mantencionService";
import { FiPlusCircle } from "react-icons/fi";
import Swal from "sweetalert2";

// ─────────────────────────────────────────────
// Valores iniciales del formulario
// ─────────────────────────────────────────────
const FORM_INICIAL = {
  imagen: "",
  numeroInterno: "",
  placa: "",
  marca: "",
  modelo: "",
  anio: "",
};

// ─────────────────────────────────────────────
// Campo reutilizable
// ─────────────────────────────────────────────
function Campo({ label, ...props }) {
  return (
    <div>
      <label className="uppercase text-gray-600 block text-[10px] font-bold mt-2">
        {label}
      </label>
      <input
        className="w-full mt-1 p-1.5 border rounded-lg bg-gray-50 text-black text-xs focus:outline-none focus:ring-2 focus:ring-green-400"
        {...props}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// Modal genérico (Crear / Editar)
// ─────────────────────────────────────────────
function BusFormModal({ titulo, form, setForm, onGuardar, onCerrar }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 text-black">
      <div className="bg-green-200 p-6 rounded-xl shadow-lg w-[420px] max-h-[90vh] overflow-y-auto">
        <p className="text-lime-900 font-bold text-xl sm:text-2xl text-center mb-3 italic">
          {titulo}
        </p>

        {/* Vista previa de imagen */}
        {form.imagen && (
          <img
            src={form.imagen}
            alt="Vista previa"
            className="w-full h-36 object-contain rounded-lg mb-2 bg-green-200 border border-green-300"
            onError={(e) => (e.target.style.display = "none")}
          />
        )}

        <Campo
          label="URL Imagen del Bus"
          placeholder="https://res.cloudinary.com/..."
          value={form.imagen}
          onChange={(e) => setForm({ ...form, imagen: e.target.value })}
        />
        <Campo
          label="Número Interno del Bus *"
          placeholder="Ej: BUS-042"
          value={form.numeroInterno}
          onChange={(e) => setForm({ ...form, numeroInterno: e.target.value })}
        />
        <Campo
          label="Placa del Bus *"
          placeholder="Ej: ABC-123"
          value={form.placa}
          onChange={(e) => setForm({ ...form, placa: e.target.value })}
        />
        <Campo
          label="Marca"
          placeholder="Ej: Mercedes-Benz"
          value={form.marca}
          onChange={(e) => setForm({ ...form, marca: e.target.value })}
        />
        <Campo
          label="Modelo"
          placeholder="Ej: O500 RS"
          value={form.modelo}
          onChange={(e) => setForm({ ...form, modelo: e.target.value })}
        />
        <Campo
          label="Año"
          placeholder="Ej: 2020"
          type="number"
          min="1990"
          max={new Date().getFullYear() + 1}
          value={form.anio}
          onChange={(e) => setForm({ ...form, anio: e.target.value })}
        />

        <p className="text-[10px] text-gray-500 mt-2">* Campos obligatorios</p>

        <div className="flex justify-between mt-4">
          <button
            onClick={onGuardar}
            className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-800 font-semibold text-sm"
          >
            Guardar
          </button>
          <button
            onClick={onCerrar}
            className="bg-red-400 text-white px-5 py-2 rounded-lg hover:bg-red-600 font-semibold text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────
export default function BusesPage() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  const { buses, loading, refresh } = useBuses();

  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [busEditando, setBusEditando] = useState(null);

  const [formCrear, setFormCrear] = useState(FORM_INICIAL);
  const [formEditar, setFormEditar] = useState(FORM_INICIAL);

  // Validar token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, [navigate]);

  // ─── CREAR ───────────────────────────────
  const handleCrear = async () => {
    if (!formCrear.imagen || !formCrear.numeroInterno || !formCrear.placa) {
      Swal.fire({
        icon: "warning",
        title: "Campos obligatorios",
        text: "Imagen, Número Interno y Placa son requeridos.",
        confirmButtonColor: "#16a34a",
      });
      return;
    }

    try {
      await createBus({
        ...formCrear,
        anio: Number(formCrear.anio),
        estado: ESTADOS_BUS.ACTIVO, // siempre "activo" al crear
      });
      setModalCrear(false);
      setFormCrear(FORM_INICIAL);
      refresh();
      Swal.fire({
        icon: "success",
        title: "Bus creado",
        text: `El bus ${formCrear.numeroInterno} fue registrado correctamente.`,
        confirmButtonColor: "#16a34a",
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo crear el bus.",
        confirmButtonColor: "#16a34a",
      });
    }
  };

  // ─── ABRIR MODAL EDITAR ───────────────────
  const handleAbrirEditar = (bus) => {
    setBusEditando(bus);
    setFormEditar({
      imagen: bus.imagen || "",
      numeroInterno: bus.numeroInterno || "",
      placa: bus.placa || "",
      marca: bus.marca || "",
      modelo: bus.modelo || "",
      anio: bus.anio ? String(bus.anio) : "",
    });
    setModalEditar(true);
  };

  // ─── GUARDAR EDICIÓN ─────────────────────
  const handleGuardarEdicion = async () => {
    if (!formEditar.imagen || !formEditar.numeroInterno || !formEditar.placa) {
      Swal.fire({
        icon: "warning",
        title: "Campos obligatorios",
        text: "Imagen, Número Interno y Placa son requeridos.",
        confirmButtonColor: "#16a34a",
      });
      return;
    }

    try {
      await updateBus(busEditando._id, {
        ...formEditar,
        anio: Number(formEditar.anio),
      });
      setModalEditar(false);
      setBusEditando(null);
      refresh();
      Swal.fire({
        icon: "success",
        title: "Bus actualizado",
        text: `El bus ${formEditar.numeroInterno} fue actualizado.`,
        confirmButtonColor: "#16a34a",
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el bus.",
        confirmButtonColor: "#16a34a",
      });
    }
  };

  // ─── ELIMINAR ────────────────────────────
  const handleEliminar = async (bus) => {
    const result = await Swal.fire({
      title: `¿Eliminar ${bus.numeroInterno}?`,
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#16a34a",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteBus(bus._id);
      refresh();
      Swal.fire({
        icon: "success",
        title: "Eliminado",
        text: `El bus ${bus.numeroInterno} fue eliminado.`,
        confirmButtonColor: "#16a34a",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar el bus.",
        confirmButtonColor: "#16a34a",
      });
    }
  };

  // ─── LOADING ─────────────────────────────
  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen flex">
        <SidebarAdmin isOpen={isOpen} toggleSidebar={toggleSidebar} />
        <main className="flex-1 p-6 flex items-center justify-center">
          <p className="text-lime-900 font-bold italic text-lg animate-pulse">
            Cargando flota...
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen flex">
      <SidebarAdmin isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <main
        className={`flex-1 bg-green-300 p-2 sm:p-6 transition-all duration-300 ${
          isOpen ? "ml-48" : "ml-20"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          {/* HEADER */}
          <div className="mb-4 grid grid-cols-3 items-center">
            <div />
            <p className="text-lime-900 font-bold text-2xl sm:text-3xl italic text-center">
              Flota de Buses
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setModalCrear(true)}
                className="flex items-center gap-2 whitespace-nowrap text-green-800 text-sm sm:text-base cursor-pointer bg-green-400 px-4 py-2 rounded-2xl hover:bg-green-600"
              >
                <FiPlusCircle className="text-lg sm:text-2xl" />
                <span className="font-semibold">Crear Bus</span>
              </button>
            </div>
          </div>

          {/* BADGES RESUMEN */}
          <div className="flex gap-3 mb-4 flex-wrap">
            <span className="bg-green-700 text-white text-xs px-3 py-1 rounded-full font-semibold">
              🚌 Total: {buses.length}
            </span>
            <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
              🟢 Activos:{" "}
              {buses.filter((b) => b.estado === ESTADOS_BUS.ACTIVO).length}
            </span>
            <span className="bg-yellow-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
              🟡 En taller:{" "}
              {buses.filter((b) => b.estado === ESTADOS_BUS.EN_TALLER).length}
            </span>
          </div>

          {/* GRID DE CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {buses.length === 0 ? (
              <p className="col-span-full text-center text-gray-700 italic py-12">
                No hay buses registrados. ¡Crea el primero!
              </p>
            ) : (
              buses.map((bus) => (
                <BusCard
                  key={bus._id}
                  bus={bus}
                  onClick={() => navigate(`/mantencion/${bus._id}`)}
                  onEditar={() => handleAbrirEditar(bus)}
                  onEliminar={() => handleEliminar(bus)}
                />
              ))
            )}
          </div>
        </div>

        {/* MODAL CREAR */}
        {modalCrear && (
          <BusFormModal
            titulo="Crear Bus"
            form={formCrear}
            setForm={setFormCrear}
            onGuardar={handleCrear}
            onCerrar={() => {
              setModalCrear(false);
              setFormCrear(FORM_INICIAL);
            }}
          />
        )}

        {/* MODAL EDITAR */}
        {modalEditar && (
          <BusFormModal
            titulo={`Editar — ${busEditando?.numeroInterno}`}
            form={formEditar}
            setForm={setFormEditar}
            onGuardar={handleGuardarEdicion}
            onCerrar={() => {
              setModalEditar(false);
              setBusEditando(null);
            }}
          />
        )}
      </main>
    </div>
  );
}
