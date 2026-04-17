import { useState } from "react";
import OrdenTrabajoModal from "./OrdenTrabajoModal";

// Badge de color por estado del mantenimiento
function EstadoBadge({ estado }) {
  const estilos = {
    abierto: "bg-blue-500 text-white",
    en_proceso: "bg-yellow-500 text-white",
    cerrado: "bg-gray-500 text-white",
    anulado: "bg-red-400 text-white",
  };
  const iconos = {
    abierto: "🔵",
    en_proceso: "🟡",
    cerrado: "✅",
    anulado: "❌",
  };
  return (
    <span
      className={`text-[11px] px-2 py-0.5 rounded-full font-semibold capitalize ${estilos[estado] || "bg-gray-300"}`}
    >
      {iconos[estado] || ""} {estado?.replace("_", " ")}
    </span>
  );
}

// Badge de tipo
function TipoBadge({ tipo }) {
  return (
    <span
      className={`text-[11px] px-2 py-0.5 rounded-full font-semibold capitalize
      ${tipo === "correctivo" ? "bg-orange-200 text-orange-800" : "bg-green-100 text-green-800"}`}
    >
      {tipo === "correctivo" ? "🔧 Correctivo" : "🛡️ Preventivo"}
    </span>
  );
}

// Formatea fecha legible
function formatFecha(fecha) {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function HistorialMantenimientos({ data, onRefresh }) {
  const [selected, setSelected] = useState(null);
  const [expandido, setExpandido] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="mt-4 text-center text-gray-600 italic py-10 bg-green-200 rounded-2xl">
        <p className="text-4xl mb-2">🗂️</p>
        <p className="font-semibold">Sin historial de mantenimientos</p>
        <p className="text-sm">
          Ingresa el bus a taller para crear el primero.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lime-900 text-xl italic font-bold">
          Historial de Mantenimientos
        </h2>
        <span className="bg-green-700 text-white text-xs px-3 py-1 rounded-full font-semibold">
          {data.length} registro{data.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {data.map((m) => {
          const estaExpandido = expandido === m._id;

          return (
            <div
              key={m._id}
              className="bg-green-200 border-2 border-green-400 rounded-2xl overflow-hidden shadow-sm"
            >
              {/* ── CABECERA — siempre visible ── */}
              <div
                className="flex flex-wrap items-center justify-between gap-2 p-4 cursor-pointer hover:bg-green-100 transition"
                onClick={() => setExpandido(estaExpandido ? null : m._id)}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <TipoBadge tipo={m.tipo} />
                  <EstadoBadge estado={m.estado} />
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-700">
                  <span>📅 {formatFecha(m.fechaIngreso)}</span>
                  {m.kilometraje > 0 && (
                    <span>🛣️ {m.kilometraje.toLocaleString()} km</span>
                  )}
                  <span className="text-green-700 font-bold text-lg">
                    {estaExpandido ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {/* ── DETALLE EXPANDIBLE ── */}
              {estaExpandido && (
                <div className="px-4 pb-4 border-t border-green-300 pt-3 grid sm:grid-cols-2 gap-3">
                  {/* Columna izquierda */}
                  <div className="space-y-1 text-sm text-gray-800">
                    <p>
                      <strong>Fecha ingreso:</strong>{" "}
                      {formatFecha(m.fechaIngreso)}
                    </p>
                    {m.fechaSalida && (
                      <p>
                        <strong>Fecha salida:</strong>{" "}
                        {formatFecha(m.fechaSalida)}
                      </p>
                    )}
                    <p>
                      <strong>Kilometraje:</strong>{" "}
                      {m.kilometraje > 0
                        ? `${m.kilometraje.toLocaleString()} km`
                        : "—"}
                    </p>
                    <p>
                      <strong>Técnico responsable:</strong>{" "}
                      {m.tecnicoResponsable || "—"}
                    </p>
                  </div>

                  {/* Columna derecha — descripción */}
                  <div className="text-sm text-gray-800">
                    <p className="font-bold mb-1">Descripción:</p>
                    <p className="bg-white rounded-lg p-2 border border-green-200 text-gray-700 min-h-12">
                      {m.descripcion || "Sin descripción."}
                    </p>
                  </div>

                  {/* Botón orden de trabajo */}
                  <div className="sm:col-span-2 flex justify-end mt-1">
                    <button
                      onClick={() => setSelected(m)}
                      className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-900 text-sm font-semibold"
                    >
                      📋 Ver / Crear Orden de Trabajo
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL ORDEN */}
      {selected && (
        <OrdenTrabajoModal
          mantenimiento={selected}
          onClose={() => {
            setSelected(null);
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </div>
  );
}
