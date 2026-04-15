import { useState, useEffect } from "react";
import crud from "../../../conexiones/crud";
import {
  getOrden,
  createOrden,
  updateOrden,
} from "../services/mantencionService";

export default function OrdenTrabajoModal({ mantenimiento, onClose }) {
  const [orden, setOrden] = useState(null);

  const [repuestosDB, setRepuestosDB] = useState([]);
  const [busquedaRep, setBusquedaRep] = useState("");
  const [repuestosSugeridos, setRepuestosSugeridos] = useState([]);

  // ===============================
  // 🔄 CARGA INICIAL
  // ===============================
  useEffect(() => {
    if (mantenimiento?._id) {
      loadOrden();
      cargarRepuestos();
    }
  }, [mantenimiento]);

  const loadOrden = async () => {
    try {
      const data = await getOrden(mantenimiento._id);

      if (data && data._id) {
        setOrden({
          ...data,
          checklist: data.checklist || [],
          repuestos: data.repuestos || [],
        });
      } else {
        throw new Error();
      }
    } catch {
      setOrden({
        mantenimientoId: mantenimiento._id,
        estado: "abierta",
        observaciones: "",
        firmaTecnico: "",
        checklist: [],
        repuestos: [],
      });
    }
  };

  const cargarRepuestos = async () => {
    try {
      const res = await crud.GET("/api/productos-repuestos");
      const lista = Array.isArray(res) ? res : res?.productos || [];
      setRepuestosDB(lista);
    } catch {
      setRepuestosDB([]);
    }
  };

  // ===============================
  // 🔍 AUTOCOMPLETE
  // ===============================
  useEffect(() => {
    const delay = setTimeout(() => {
      if (!busquedaRep.trim()) return setRepuestosSugeridos([]);

      const filtrados = repuestosDB
        .filter((p) =>
          (p.nombre || "").toLowerCase().includes(busquedaRep.toLowerCase()),
        )
        .slice(0, 10);

      setRepuestosSugeridos(filtrados);
    }, 300);

    return () => clearTimeout(delay);
  }, [busquedaRep, repuestosDB]);

  const seleccionarRepuesto = (rep) => {
    if (orden.repuestos.find((r) => r.productoId === rep._id)) {
      alert("Repuesto ya agregado");
      return;
    }

    setOrden({
      ...orden,
      repuestos: [
        ...orden.repuestos,
        {
          productoId: rep._id,
          nombre: rep.nombre,
          cantidad: 1,
          precio: rep.precio || 0, // ✅ FIX 2: toma el precio real del producto
          recibidoPor: "",
          fechaEntrega: "",
        },
      ],
    });

    setBusquedaRep("");
  };

  // ===============================
  // 💾 GUARDAR
  // ===============================
  const guardar = async () => {
    if (!orden.firmaTecnico) {
      alert("La firma del técnico es obligatoria");
      return;
    }

    try {
      if (orden._id) {
        await updateOrden(orden._id, orden);
      } else {
        await createOrden({
          ...orden,
          mantenimientoId: mantenimiento._id,
        });
      }

      alert("Orden guardada");
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error guardando orden");
    }
  };

  // ===============================
  // 🔒 CERRAR ORDEN
  // ===============================
  const cerrarOrden = async () => {
    if (!orden._id) return alert("Primero guarda la orden");

    try {
      await updateOrden(orden._id, {
        ...orden,
        estado: "finalizada",
      });

      alert("Orden cerrada");
      onClose();
    } catch {
      alert("Error cerrando orden");
    }
  };

  if (!orden) return <p className="text-center">Cargando...</p>;

  const isFinalizada = orden.estado === "finalizada";

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-green-200 p-6 w-[700px] max-h-[90vh] overflow-y-auto rounded text-black"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-center mb-2">Orden de Trabajo</h2>

        {/* ESTADO */}
        <p className="text-center font-semibold mb-2">Estado: {orden.estado}</p>

        {/* MENSAJE SI ESTÁ CERRADA */}
        {isFinalizada && (
          <p className="text-red-600 text-center font-bold mb-2">
            Orden cerrada - solo lectura
          </p>
        )}

        {/* OBSERVACIONES */}
        <textarea
          disabled={isFinalizada}
          className="w-full border p-2 rounded mb-2"
          placeholder="Observaciones"
          value={orden.observaciones}
          onChange={(e) =>
            setOrden({ ...orden, observaciones: e.target.value })
          }
        />

        {/* FIRMA */}
        <input
          disabled={isFinalizada}
          className="w-full border p-2 rounded mb-4"
          placeholder="Firma Técnico"
          value={orden.firmaTecnico}
          onChange={(e) => setOrden({ ...orden, firmaTecnico: e.target.value })}
        />

        {/* CHECKLIST */}
        <h3 className="font-bold mb-2">Checklist</h3>

        {!isFinalizada && (
          <button
            className="bg-green-600 text-white px-3 py-1 rounded mb-2"
            onClick={() =>
              setOrden({
                ...orden,
                checklist: [
                  ...orden.checklist,
                  { item: "", estado: "pendiente" },
                ],
              })
            }
          >
            + Agregar ítem
          </button>
        )}

        {orden.checklist.map((c, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              disabled={isFinalizada}
              className="w-full border p-1 rounded"
              value={c.item}
              onChange={(e) => {
                const copy = [...orden.checklist];
                copy[i].item = e.target.value;
                setOrden({ ...orden, checklist: copy });
              }}
            />

            <select
              disabled={isFinalizada}
              value={c.estado}
              onChange={(e) => {
                const copy = [...orden.checklist];
                copy[i].estado = e.target.value;
                setOrden({ ...orden, checklist: copy });
              }}
            >
              <option value="pendiente">Pendiente</option>
              <option value="ok">OK</option>
              <option value="reparar">Reparar</option>
            </select>

            {!isFinalizada && (
              <button
                onClick={() => {
                  const copy = orden.checklist.filter((_, idx) => idx !== i);
                  setOrden({ ...orden, checklist: copy });
                }}
              >
                ❌
              </button>
            )}
          </div>
        ))}

        {/* REPUESTOS */}
        <h3 className="font-bold mt-4 mb-2">Repuestos</h3>

        {!isFinalizada && (
          <input
            placeholder="Buscar repuesto..."
            value={busquedaRep}
            onChange={(e) => setBusquedaRep(e.target.value)}
            className="border p-2 rounded w-full mb-2"
          />
        )}

        {!isFinalizada &&
          repuestosSugeridos.map((r) => (
            <div
              key={r._id}
              onClick={() => seleccionarRepuesto(r)}
              className="cursor-pointer p-2 hover:bg-green-100"
            >
              {r.nombre}
            </div>
          ))}

        {orden.repuestos.map((r, i) => (
          <div key={i} className="grid grid-cols-4 gap-2 mb-2">
            <input value={r.nombreProducto || r.nombre || ""} readOnly />

            <input
              disabled={isFinalizada}
              type="number"
              value={r.cantidad}
              onChange={(e) => {
                const copy = [...orden.repuestos];
                copy[i].cantidad = Number(e.target.value);
                setOrden({ ...orden, repuestos: copy });
              }}
            />

            {/* ✅ FIX 1: si r.precio es 0, toma el precio del producto populado */}
            <input
              disabled={isFinalizada}
              placeholder="Precio"
              value={r.precio || r.productoId?.precio || 0}
              onChange={(e) => {
                const copy = [...orden.repuestos];
                copy[i].precio = Number(e.target.value);
                setOrden({ ...orden, repuestos: copy });
              }}
            />

            {!isFinalizada && (
              <button
                onClick={() => {
                  const copy = orden.repuestos.filter((_, idx) => idx !== i);
                  setOrden({ ...orden, repuestos: copy });
                }}
              >
                ❌
              </button>
            )}
          </div>
        ))}

        {/* BOTONES */}
        <div className="flex justify-between mt-4">
          <button
            onClick={guardar}
            disabled={isFinalizada}
            className="bg-green-700 text-white px-4 py-2 rounded"
          >
            {orden._id ? "Actualizar" : "Guardar"}
          </button>

          <button
            onClick={cerrarOrden}
            disabled={isFinalizada}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Cerrar Orden
          </button>

          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
