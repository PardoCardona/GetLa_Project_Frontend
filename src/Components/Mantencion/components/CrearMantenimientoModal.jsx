import { useState } from "react";
import { createMantenimiento } from "../services/mantencionService";
import Swal from "sweetalert2";

export default function CrearMantenimientoModal({
  busId,
  busEstado,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState({
    tipo: "preventivo",
    kilometraje: "",
    descripcion: "",
    fechaIngreso: new Date().toISOString().split("T")[0],
    tecnicoResponsable: "",
  });

  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async () => {
    // ── Validar bus en taller ANTES de llamar al backend ──────────────
    if (busEstado === "en_taller") {
      Swal.fire({
        icon: "warning",
        title: "Bus en taller",
        text: "Este bus ya tiene un mantenimiento en curso. Ciérralo antes de abrir uno nuevo.",
        confirmButtonColor: "#16a34a",
      });
      return;
    }

    // ── Validaciones de campos ─────────────────────────────────────────
    if (!form.tipo) {
      Swal.fire({
        icon: "warning",
        title: "Campo obligatorio",
        text: "El tipo de mantenimiento es obligatorio.",
        confirmButtonColor: "#16a34a",
      });
      return;
    }

    if (!form.kilometraje || Number(form.kilometraje) <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Campo obligatorio",
        text: "El kilometraje es obligatorio y debe ser mayor a 0.",
        confirmButtonColor: "#16a34a",
      });
      return;
    }

    if (!form.descripcion.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campo obligatorio",
        text: "La descripción es obligatoria.",
        confirmButtonColor: "#16a34a",
      });
      return;
    }

    setGuardando(true);

    try {
      const payload = {
        busId,
        tipo: form.tipo,
        kilometraje: Number(form.kilometraje),
        descripcion: form.descripcion.trim(),
        fechaIngreso: form.fechaIngreso,
      };

      // Solo incluir técnico si tiene valor
      if (form.tecnicoResponsable.trim()) {
        payload.tecnicoResponsable = form.tecnicoResponsable.trim();
      }

      const respuesta = await createMantenimiento(payload);

      // Detectar error del backend (crud nunca lanza excepción)
      if (
        respuesta?.error ||
        respuesta?.msg === "El bus ya tiene un mantenimiento en curso"
      ) {
        throw new Error(respuesta.error || respuesta.msg);
      }

      Swal.fire({
        icon: "success",
        title: "Mantenimiento creado",
        text: `Mantenimiento ${form.tipo} registrado correctamente.`,
        confirmButtonColor: "#16a34a",
        timer: 2000,
        showConfirmButton: false,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al crear mantenimiento:", error.message);
      Swal.fire({
        icon: "error",
        title: "Error al crear mantenimiento",
        text: error.message || "No se pudo crear el mantenimiento.",
        confirmButtonColor: "#16a34a",
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div
      className="fixed bg-black/50 inset-0 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-green-300 p-5 w-[420px] rounded-xl text-lime-900 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-lime-900 font-bold text-xl sm:text-2xl text-center mb-4 italic">
          Nuevo Mantenimiento
        </p>

        {/* ALERTA si el bus está en taller */}
        {busEstado === "en_taller" && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 text-xs rounded-lg p-2 mb-3 text-center font-semibold">
            ⚠️ Este bus ya está en taller. No se puede abrir un nuevo
            mantenimiento.
          </div>
        )}

        {/* TIPO */}
        <label className="uppercase text-gray-600 block text-[10px] font-bold mt-2">
          Tipo de Mantenimiento *
        </label>
        <select
          value={form.tipo}
          onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          className="w-full mt-1 p-1.5 border rounded-lg bg-gray-50 text-black text-sm"
        >
          <option value="preventivo">Mantenimiento Preventivo</option>
          <option value="correctivo">Mantenimiento Correctivo</option>
        </select>

        {/* FECHA */}
        <label className="uppercase text-gray-600 block text-[10px] font-bold mt-2">
          Fecha de Ingreso
        </label>
        <input
          type="date"
          value={form.fechaIngreso}
          onChange={(e) => setForm({ ...form, fechaIngreso: e.target.value })}
          className="w-full mt-1 p-1.5 border rounded-lg bg-gray-50 text-black text-sm"
        />

        {/* KILOMETRAJE */}
        <label className="uppercase text-gray-600 block text-[10px] font-bold mt-2">
          Kilometraje Actual *
        </label>
        <input
          type="number"
          min="1"
          className="w-full mt-1 p-1.5 border rounded-lg bg-gray-50 text-black text-sm"
          placeholder="Ej: 125000"
          value={form.kilometraje}
          onChange={(e) => setForm({ ...form, kilometraje: e.target.value })}
        />

        {/* DESCRIPCIÓN */}
        <label className="uppercase text-gray-600 block text-[10px] font-bold mt-2">
          Descripción *
        </label>
        <textarea
          rows={4}
          className="w-full mt-1 p-1.5 border rounded-lg bg-gray-50 text-black text-sm resize-none"
          placeholder="Descripción del problema o trabajo a realizar"
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
        />

        {/* TÉCNICO */}
        <label className="uppercase text-gray-600 block text-[10px] font-bold mt-2">
          Técnico Responsable
        </label>
        <input
          className="w-full mt-1 p-1.5 border rounded-lg bg-gray-50 text-black text-sm"
          placeholder="Nombre del técnico"
          value={form.tecnicoResponsable}
          onChange={(e) =>
            setForm({ ...form, tecnicoResponsable: e.target.value })
          }
        />

        <p className="text-[10px] text-gray-600 mt-2">* Campos obligatorios</p>

        <div className="flex justify-around mt-4">
          <button
            onClick={handleSubmit}
            disabled={guardando || busEstado === "en_taller"}
            className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-800 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {guardando ? "Guardando..." : "Guardar"}
          </button>

          <button
            onClick={onClose}
            className="bg-red-400 text-white px-5 py-2 rounded-lg hover:bg-red-600 font-semibold text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
