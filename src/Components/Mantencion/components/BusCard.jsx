export default function BusCard({ bus, onClick }) {
  const getEstadoColor = () => {
    switch (bus.estado) {
      case "activo":
        return "bg-green-500";
      case "en_taller":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="bg-green-200 shadow-md rounded-xl p-4 flex flex-col items-center border border-green-300 hover:shadow-lg transition">
      {/* 🖼️ IMAGEN */}
      <img
        src={bus.imagen || "https://via.placeholder.com/150"}
        alt={bus.numeroInterno}
        className="h-40 object-contain mb-3 rounded-2xl"
      />

      {/* 🚌 NOMBRE */}
      <p className="font-bold text-lg text-green-900">{bus.numeroInterno}</p>

      {/* 📄 INFO */}
      <p className="text-sm text-gray-800">
        <strong>Placa:</strong> {bus.placa}
      </p>

      <p className="text-sm text-gray-800">
        <strong>Marca:</strong> {bus.marca || "N/A"}
      </p>

      <p className="text-sm text-gray-800">
        <strong>Modelo:</strong> {bus.modelo || "N/A"}
      </p>

      <p className="text-sm text-gray-800">
        <strong>Año:</strong> {bus.anio || "N/A"}
      </p>

      {/* 🟢 ESTADO */}
      <span
        className={`text-white text-xs px-3 py-1 rounded-full mt-2 ${getEstadoColor()}`}
      >
        {bus.estado}
      </span>

      {/* 🔘 BOTÓN */}
      <button
        onClick={() => onClick(bus)}
        className="mt-3 w-full bg-green-700 text-white text-sm rounded-lg py-2 hover:bg-green-800"
      >
        ⚙️ Ver Detalle
      </button>
    </div>
  );
}
