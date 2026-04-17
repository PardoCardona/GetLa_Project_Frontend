import { useState, useEffect } from "react";
import crud from "../../../conexiones/crud";
import {
  getOrden,
  createOrden,
  updateOrden,
} from "../services/mantencionService";
import Swal from "sweetalert2";

export default function OrdenTrabajoModal({ mantenimiento, onClose }) {
  const [orden, setOrden] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const [repuestosDB, setRepuestosDB] = useState([]);
  const [busquedaRep, setBusquedaRep] = useState("");
  const [repuestosSugeridos, setRepuestosSugeridos] = useState([]);

  const [usuario, setUsuario] = useState(null);

  // ✅ OBTENER USUARIO
  const getUsuario = () => {
    try {
      const user = localStorage.getItem("usuario");
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  };

  // ─────────────────────────────────────────
  // CARGA INICIAL
  // ─────────────────────────────────────────
  useEffect(() => {
    if (mantenimiento?._id) {
      loadOrden();
      cargarRepuestos();
    }

    setUsuario(getUsuario());
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
        throw new Error("sin orden");
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

  // AUTOCOMPLETE
  useEffect(() => {
    const delay = setTimeout(() => {
      if (!busquedaRep.trim()) return setRepuestosSugeridos([]);
      const filtrados = repuestosDB
        .filter((p) =>
          (p.nombre || "").toLowerCase().includes(busquedaRep.toLowerCase()),
        )
        .slice(0, 8);
      setRepuestosSugeridos(filtrados);
    }, 300);
    return () => clearTimeout(delay);
  }, [busquedaRep, repuestosDB]);

  const seleccionarRepuesto = (rep) => {
    const yaAgregado = orden.repuestos.some((r) => {
      const id = r.productoId?._id || r.productoId;
      return String(id) === String(rep._id);
    });

    if (yaAgregado) {
      Swal.fire({
        icon: "warning",
        title: "Repuesto duplicado",
        text: `${rep.nombre} ya está en la lista.`,
        confirmButtonColor: "#16a34a",
        timer: 1800,
        showConfirmButton: false,
      });
      return;
    }

    setOrden({
      ...orden,
      repuestos: [
        ...orden.repuestos,
        {
          productoId: rep._id,
          nombreProducto: rep.nombre,
          referenciaProducto: rep.referencia || "",
          cantidad: 1,
          precio: rep.precio || 0,
          recibidoPor: usuario?._id || undefined, // ✅ FIX
          fechaEntrega: new Date().toISOString().split("T")[0],
        },
      ],
    });

    setBusquedaRep("");
    setRepuestosSugeridos([]);
  };

  const guardar = async () => {
    if (!orden.firmaTecnico?.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campo obligatorio",
        text: "La firma del técnico es obligatoria.",
        confirmButtonColor: "#16a34a",
      });
      return;
    }

    const payload = {
      mantenimientoId: mantenimiento._id,
      estado: orden.estado,
      observaciones: orden.observaciones || "",
      firmaTecnico: orden.firmaTecnico.trim(),
      checklist: orden.checklist.filter((c) => c.item?.trim()),
      repuestos: orden.repuestos.map((r) => ({
        productoId: r.productoId?._id || r.productoId,
        cantidad: Number(r.cantidad) || 1,
        precio: Number(r.precio) || 0,
        recibidoPor: r.recibidoPor || undefined,
        fechaEntrega: r.fechaEntrega || undefined,
      })),
    };

    setGuardando(true);
    try {
      let respuesta;
      if (orden._id) {
        respuesta = await updateOrden(orden._id, payload);
      } else {
        respuesta = await createOrden(payload);
      }

      if (respuesta?.error || respuesta?.msg?.includes("error")) {
        throw new Error(respuesta.error || respuesta.msg);
      }

      Swal.fire({
        icon: "success",
        title: orden._id ? "Orden actualizada" : "Orden creada",
        confirmButtonColor: "#16a34a",
        timer: 2000,
        showConfirmButton: false,
      });

      onClose();
    } catch (error) {
      console.error("Error guardando orden:", error.message);
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: error.message || "No se pudo guardar la orden.",
        confirmButtonColor: "#16a34a",
      });
    } finally {
      setGuardando(false);
    }
  };

  const cerrarOrden = async () => {
    if (!orden._id) {
      Swal.fire({
        icon: "warning",
        title: "Orden sin guardar",
        text: "Primero guarda la orden antes de cerrarla.",
        confirmButtonColor: "#16a34a",
      });
      return;
    }

    const confirm = await Swal.fire({
      title: "¿Cerrar orden de trabajo?",
      text: "Una vez cerrada no podrá editarse.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#dc2626",
    });

    if (!confirm.isConfirmed) return;

    try {
      await crud.PUT(`/api/ordenTrabajo/${orden._id}/cerrar`);

      Swal.fire({
        icon: "success",
        title: "Orden cerrada",
        confirmButtonColor: "#16a34a",
        timer: 2000,
        showConfirmButton: false,
      });

      onClose();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    }
  };

  if (!orden) return null;

  const isFinalizada = orden.estado === "finalizada";
  const bus = mantenimiento?.busId;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-green-200 p-6 w-[720px] max-h-[92vh] overflow-y-auto rounded-xl text-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── ENCABEZADO ─────────────────────────────── */}
        <h2 className="text-xl font-bold text-center text-lime-900 italic mb-1">
          Orden de Trabajo
        </h2>

        {/* USUARIO */}
        <div className="mb-2">
          <span className="text-xs text-gray-600 font-bold">Recibido por:</span>
          <div className="bg-gray-100 border rounded-lg p-1.5 text-xs">
            {usuario?.nombre || "—"}
          </div>
        </div>

        {/* Info del mantenimiento */}
        <div className="bg-green-300 rounded-lg p-3 mb-3 text-sm grid grid-cols-2 gap-1">
          <p>
            <strong>Bus:</strong> {bus?.numeroInterno || "—"}
          </p>
          <p>
            <strong>Placa:</strong> {bus?.placa || "—"}
          </p>
          <p>
            <strong>Tipo:</strong>{" "}
            <span className="capitalize">{mantenimiento?.tipo}</span>
          </p>
          <p>
            <strong>Estado orden:</strong>{" "}
            <span
              className={`font-semibold capitalize ${isFinalizada ? "text-red-700" : "text-green-800"}`}
            >
              {orden.estado}
            </span>
          </p>
        </div>

        {isFinalizada && (
          <div className="bg-red-100 border border-red-300 text-red-700 text-xs text-center rounded-lg p-2 mb-3 font-semibold">
            🔒 Orden finalizada — solo lectura
          </div>
        )}

        {/* ── SECCIÓN A: DATOS GENERALES ─────────────── */}
        <h3 className="font-bold text-lime-900 mt-2 mb-1 border-b border-green-400 pb-1">
          A — Datos Generales
        </h3>

        <label className="uppercase text-gray-600 block text-[10px] font-bold mt-2">
          Observaciones
        </label>
        <textarea
          disabled={isFinalizada}
          rows={3}
          className="w-full mt-1 p-1.5 border rounded-lg bg-gray-50 text-black text-sm resize-none disabled:opacity-60"
          placeholder="Observaciones del trabajo realizado"
          value={orden.observaciones}
          onChange={(e) =>
            setOrden({ ...orden, observaciones: e.target.value })
          }
        />

        <label className="uppercase text-gray-600 block text-[10px] font-bold mt-2">
          Firma del Técnico *
        </label>
        <input
          disabled={isFinalizada}
          className="w-full mt-1 p-1.5 border rounded-lg bg-gray-50 text-black text-sm disabled:opacity-60"
          placeholder="Nombre completo del técnico"
          value={orden.firmaTecnico}
          onChange={(e) => setOrden({ ...orden, firmaTecnico: e.target.value })}
        />

        {/* ── SECCIÓN B: CHECKLIST ───────────────────── */}
        <h3 className="font-bold text-lime-900 mt-4 mb-1 border-b border-green-400 pb-1">
          B — Checklist de Inspección
        </h3>

        {!isFinalizada && (
          <button
            className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm mb-2 hover:bg-green-800"
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

        {orden.checklist.length === 0 && (
          <p className="text-gray-500 text-xs italic mb-2">
            Sin ítems de checklist.
          </p>
        )}

        {orden.checklist.map((c, i) => (
          <div key={i} className="flex gap-2 mb-2 items-center">
            <input
              disabled={isFinalizada}
              className="flex-1 border p-1.5 rounded-lg bg-gray-50 text-sm disabled:opacity-60"
              placeholder="Punto a revisar (ej: Frenos)"
              value={c.item}
              onChange={(e) => {
                const copy = [...orden.checklist];
                copy[i] = { ...copy[i], item: e.target.value };
                setOrden({ ...orden, checklist: copy });
              }}
            />
            <select
              disabled={isFinalizada}
              value={c.estado}
              onChange={(e) => {
                const copy = [...orden.checklist];
                copy[i] = { ...copy[i], estado: e.target.value };
                setOrden({ ...orden, checklist: copy });
              }}
              className={`border p-1.5 rounded-lg text-sm font-semibold disabled:opacity-60
                ${
                  c.estado === "ok"
                    ? "bg-green-100 text-green-800"
                    : c.estado === "reparar"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-50 text-yellow-700"
                }`}
            >
              <option value="pendiente">⏳ Pendiente</option>
              <option value="ok">✅ OK</option>
              <option value="reparar">🔧 Reparar</option>
            </select>
            {!isFinalizada && (
              <button
                onClick={() =>
                  setOrden({
                    ...orden,
                    checklist: orden.checklist.filter((_, idx) => idx !== i),
                  })
                }
                className="text-red-500 hover:text-red-700 text-lg leading-none"
                title="Eliminar ítem"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        {/* ── SECCIÓN C: REPUESTOS ───────────────────── */}
        <h3 className="font-bold text-lime-900 mt-4 mb-1 border-b border-green-400 pb-1">
          C — Repuestos Utilizados
        </h3>

        {!isFinalizada && (
          <div className="relative mb-2">
            <input
              placeholder="🔍 Buscar repuesto por nombre..."
              value={busquedaRep}
              onChange={(e) => setBusquedaRep(e.target.value)}
              className="border p-1.5 rounded-lg w-full text-sm bg-gray-50"
            />
            {repuestosSugeridos.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-green-300 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                {repuestosSugeridos.map((r) => (
                  <div
                    key={r._id}
                    onClick={() => seleccionarRepuesto(r)}
                    className="cursor-pointer px-3 py-2 hover:bg-green-100 text-sm border-b last:border-0"
                  >
                    <span className="font-semibold">{r.nombre}</span>
                    {r.referencia && (
                      <span className="text-gray-500 text-xs ml-2">
                        Ref: {r.referencia}
                      </span>
                    )}
                    {r.precio !== undefined && (
                      <span className="text-green-700 text-xs ml-2 font-semibold">
                        ${r.precio.toLocaleString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {orden.repuestos.length === 0 && (
          <p className="text-gray-500 text-xs italic mb-2">
            Sin repuestos agregados.
          </p>
        )}

        {/* Encabezados de tabla */}
        {orden.repuestos.length > 0 && (
          <div className="grid grid-cols-12 gap-1 mb-1 text-[10px] uppercase font-bold text-gray-500 px-1">
            <span className="col-span-3">Repuesto</span>
            <span className="col-span-1 text-center">Cant.</span>
            <span className="col-span-2 text-center">Precio</span>
            <span className="col-span-2 text-center">Subtotal</span>
            <span className="col-span-2">Recibido por</span>
            <span className="col-span-1">Fecha</span>
            <span className="col-span-1"></span>
          </div>
        )}

        {orden.repuestos.map((r, i) => {
          const subtotal = (Number(r.precio) || 0) * (Number(r.cantidad) || 1);
          return (
            <div key={i} className="grid grid-cols-12 gap-1 mb-2 items-center">
              {/* Nombre — readonly */}
              <div
                className="col-span-3 bg-gray-100 border rounded-lg p-1.5 text-xs truncate"
                title={r.nombreProducto || r.nombre}
              >
                {r.nombreProducto || r.nombre || "—"}
              </div>

              {/* Cantidad */}
              <input
                disabled={isFinalizada}
                type="number"
                min="1"
                value={r.cantidad}
                onChange={(e) => {
                  const copy = [...orden.repuestos];
                  copy[i] = { ...copy[i], cantidad: Number(e.target.value) };
                  setOrden({ ...orden, repuestos: copy });
                }}
                className="col-span-1 border rounded-lg p-1.5 text-xs text-center disabled:opacity-60 bg-gray-50"
              />

              {/* Precio */}
              <input
                disabled={isFinalizada}
                type="number"
                min="0"
                value={r.precio}
                onChange={(e) => {
                  const copy = [...orden.repuestos];
                  copy[i] = { ...copy[i], precio: Number(e.target.value) };
                  setOrden({ ...orden, repuestos: copy });
                }}
                className="col-span-2 border rounded-lg p-1.5 text-xs text-center disabled:opacity-60 bg-gray-50"
              />

              {/* Subtotal — readonly */}
              <div className="col-span-2 bg-gray-100 border rounded-lg p-1.5 text-xs text-center font-semibold text-green-800">
                ${subtotal.toLocaleString()}
              </div>

              {/* Recibido por */}
              <input
                disabled={isFinalizada}
                placeholder="Nombre"
                value={usuario?.nombre || ""}
                onChange={(e) => {
                  const copy = [...orden.repuestos];
                  copy[i] = { ...copy[i], recibidoPor: e.target.value };
                  setOrden({ ...orden, repuestos: copy });
                }}
                className="col-span-2 border rounded-lg p-1.5 text-xs disabled:opacity-60 bg-gray-50"
              />

              {/* Fecha entrega */}
              <input
                disabled={isFinalizada}
                type="date"
                value={r.fechaEntrega ? r.fechaEntrega.split("T")[0] : ""}
                onChange={(e) => {
                  const copy = [...orden.repuestos];
                  copy[i] = { ...copy[i], fechaEntrega: e.target.value };
                  setOrden({ ...orden, repuestos: copy });
                }}
                className="col-span-1 border rounded-lg p-1 text-[10px] disabled:opacity-60 bg-gray-50"
              />

              {/* Eliminar */}
              {!isFinalizada && (
                <button
                  onClick={() =>
                    setOrden({
                      ...orden,
                      repuestos: orden.repuestos.filter((_, idx) => idx !== i),
                    })
                  }
                  className="col-span-1 text-red-500 hover:text-red-700 text-lg text-center leading-none"
                  title="Quitar repuesto"
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}

        {/* Total repuestos */}
        {orden.repuestos.length > 0 && (
          <div className="flex justify-end mt-1 mb-3">
            <span className="bg-green-700 text-white text-sm px-4 py-1 rounded-full font-bold">
              Total: $
              {orden.repuestos
                .reduce(
                  (acc, r) =>
                    acc + (Number(r.precio) || 0) * (Number(r.cantidad) || 1),
                  0,
                )
                .toLocaleString()}
            </span>
          </div>
        )}

        {/* ── BOTONES ────────────────────────────────── */}
        <div className="flex justify-between mt-4 pt-3 border-t border-green-400">
          <button
            onClick={guardar}
            disabled={isFinalizada || guardando}
            className="bg-green-700 text-white px-5 py-2 rounded-lg hover:bg-green-900 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {guardando ? "Guardando..." : orden._id ? "Actualizar" : "Guardar"}
          </button>

          <button
            onClick={cerrarOrden}
            disabled={isFinalizada || !orden._id}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-800 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title={!orden._id ? "Guarda la orden primero" : ""}
          >
            Cerrar Orden
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
