import { useState } from "react";
import OrdenTrabajoModal from "./OrdenTrabajoModal";

export default function HistorialMantenimientos({ data }) {
  const [selected, setSelected] = useState(null);

  return (
    <div>
      <h2 className="text-lime-900 text-xl italic mt-4 font-bold">
        Historial de Mantenimientos
      </h2>

      {data.map((m) => (
        <div
          key={m._id}
          className="border-3 border-green-900 p-2 mt-2 rounded-xl"
        >
          <p className="text-lime-900 font-bold ">Tipo: {m.tipo}</p>
          <p className="text-lime-900 font-bold ">Estado: {m.estado}</p>

          <div>
            <button
              onClick={() => setSelected(m)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-900"
            >
              Ver / Crear Orden
            </button>
          </div>
        </div>
      ))}

      {selected && (
        <OrdenTrabajoModal
          mantenimiento={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
