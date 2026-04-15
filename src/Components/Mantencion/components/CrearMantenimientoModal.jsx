import { useState } from "react";
import { createMantenimiento } from "../services/mantencionService";

export default function CrearMantenimientoModal({ busId, onClose, onSuccess }) {
  const [form, setForm] = useState({
    tipo: "preventivo",
    kilometraje: "",
    descripcion: "",
    fechaIngreso: new Date().toISOString().split("T")[0], // ✅ hoy por defecto
    tecnicoResponsable: "",
  });

  const handleSubmit = async () => {
    // 🔎 VALIDACIONES
    if (!form.tipo) {
      alert("El tipo de mantenimiento es obligatorio");
      return;
    }

    if (!form.kilometraje || Number(form.kilometraje) <= 0) {
      alert("El kilometraje es obligatorio y debe ser mayor a 0");
      return;
    }

    if (!form.descripcion) {
      alert("La descripción es obligatoria");
      return;
    }

    try {
      await createMantenimiento({
        busId,
        tipo: form.tipo,
        kilometraje: Number(form.kilometraje), // ✅ FIX número
        descripcion: form.descripcion,
        fechaIngreso: form.fechaIngreso,
        tecnicoResponsable: form.tecnicoResponsable,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error creando mantenimiento");
    }
  };

  return (
    <div
      className="fixed bg-black/50 inset-0 flex items-center justify-center z-50"
      onClick={onClose} // ✅ cerrar al hacer click afuera
    >
      <div
        className="bg-green-300 p-4 w-96 rounded text-lime-900"
        onClick={(e) => e.stopPropagation()} // ✅ evitar cierre interno
      >
        <p className="text-lime-900 font-bold text-xl sm:text-2xl text-center mb-3 italic">
          Nuevo Mantenimiento
        </p>

        {/* TIPO */}
        <select
          value={form.tipo}
          onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          className="w-full mt-1 p-1.5 border rounded-lg bg-gray-50 text-black text-sm"
        >
          <option value="preventivo">Mantenimiento Preventivo</option>
          <option value="correctivo">Mantenimiento Correctivo</option>
        </select>

        {/* FECHA */}
        <input
          type="date"
          value={form.fechaIngreso}
          onChange={(e) => setForm({ ...form, fechaIngreso: e.target.value })}
          className="w-full mt-2 p-1.5 border rounded-lg bg-gray-50 text-black text-sm"
        />

        {/* KILOMETRAJE */}
        <input
          type="number"
          className="w-full mt-2 p-1.5 border rounded-lg bg-gray-50 text-black text-sm"
          placeholder="Ingresar Kilometraje Actual"
          value={form.kilometraje}
          onChange={(e) => setForm({ ...form, kilometraje: e.target.value })}
        />

        {/* DESCRIPCIÓN */}
        <textarea
          rows={6}
          className="w-full mt-2 p-1.5 border rounded-lg bg-gray-50 text-black text-sm"
          placeholder="Descripción de la avería"
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
        />

        {/* TÉCNICO */}
        <input
          className="w-full mt-2 p-1.5 border rounded-lg bg-gray-50 text-black text-sm"
          placeholder="Técnico responsable"
          value={form.tecnicoResponsable}
          onChange={(e) =>
            setForm({ ...form, tecnicoResponsable: e.target.value })
          }
        />

        <div className="flex justify-around mt-4">
          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-800"
          >
            Guardar
          </button>

          <button
            onClick={onClose}
            className="bg-red-400 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
