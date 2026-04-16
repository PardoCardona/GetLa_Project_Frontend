import { FiEdit2, FiTrash2, FiSettings } from "react-icons/fi";

export default function BusCard({ bus, onClick, onEditar, onEliminar }) {
  const getEstadoStyle = () => {
    switch (bus.estado) {
      case "activo":
        return { bg: "bg-green-500", label: "🟢 Activo" };
      case "en_taller":
        return { bg: "bg-yellow-500", label: "🟡 En Taller" };
      default:
        return { bg: "bg-gray-400", label: bus.estado };
    }
  };

  const { bg, label } = getEstadoStyle();

  return (
    <div className="bg-green-200 shadow-md rounded-xl p-4 flex flex-col items-center border border-green-300 hover:shadow-lg transition">
      {/* IMAGEN */}
      <img
        src={bus.imagen || "https://via.placeholder.com/150?text=Bus"}
        alt={bus.numeroInterno}
        className="h-40 w-full object-contain mb-3 rounded-xl bg-green-200"
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/150?text=Sin+imagen";
        }}
      />

      {/* NOMBRE */}
      <p className="font-bold text-lg text-green-900">{bus.numeroInterno}</p>

      {/* INFO */}
      <div className="w-full text-sm text-gray-800 mt-1 space-y-0.5">
        <p>
          <strong>Placa:</strong> {bus.placa}
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
      </div>

      {/* ESTADO */}
      <span className={`text-white text-xs px-3 py-1 rounded-full mt-2 ${bg}`}>
        {label}
      </span>

      {/* BOTONES */}
      <div className="w-full mt-3 flex flex-col gap-2">
        <button
          onClick={onClick}
          className="w-full bg-green-700 text-white text-sm rounded-lg py-2 hover:bg-green-800 flex items-center justify-center gap-2"
        >
          <FiSettings className="text-base" />
          Ver Detalle
        </button>

        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditar();
            }}
            className="flex-1 bg-blue-500 text-white text-sm rounded-lg py-1.5 hover:bg-blue-700 flex items-center justify-center gap-1"
            title="Editar bus"
          >
            <FiEdit2 className="text-sm" />
            Editar
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onEliminar();
            }}
            className="flex-1 bg-red-400 text-white text-sm rounded-lg py-1.5 hover:bg-red-600 flex items-center justify-center gap-1"
            title="Eliminar bus"
          >
            <FiTrash2 className="text-sm" />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
