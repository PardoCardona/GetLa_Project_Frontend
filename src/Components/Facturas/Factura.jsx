import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarAdmin from "../Sidebar/SidebarAdmin";
import FacturaModal from "./FacturaModal";
import crud from "../../conexiones/crud";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";

/* ================= UTILIDADES ================= */
const formatearFecha = (fecha) => {
  if (!fecha) return "";
  return new Date(fecha).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDecimal = (valor) => {
  if (!valor) return "0";
  if (typeof valor === "object" && valor.$numberDecimal) {
    return parseFloat(valor.$numberDecimal).toFixed(2);
  }
  return parseFloat(valor).toFixed(2);
};

/* ================= PDF FACTURA GETLA ================= */
const generarPDF = (factura) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("FACTURA - GETLA", 105, 18, { align: "center" });

  let y = 28;
  doc.setFontSize(11);

  doc.text(`Factura N°: ${factura.numeroFactura}`, 15, y);
  y += 6;
  doc.text(`Fecha: ${formatearFecha(factura.createdAt)}`, 15, y);
  y += 6;

  doc.text(`Cliente: ${factura.cliente?.nombre || "-"}`, 15, y);
  y += 6;
  doc.text(`NIT / RUT: ${factura.cliente?.nit || "-"}`, 15, y);
  y += 6;
  doc.text(`Dirección: ${factura.cliente?.direccion || "-"}`, 15, y);
  y += 6;
  doc.text(`Ciudad: ${factura.cliente?.ciudad || "-"}`, 15, y);
  y += 10;

  doc.setFontSize(12);
  doc.text("Detalle de productos:", 15, y);
  y += 8;

  doc.setFontSize(10);
  doc.text("Ref", 15, y);
  doc.text("Descripción", 40, y);
  doc.text("Cant", 110, y);
  doc.text("Precio", 130, y);
  doc.text("Total", 165, y);
  y += 6;

  factura.cuerpo.forEach((item) => {
    const referencia = item.producto?.referencia || "";
    const descripcion = item.descripcionProducto || "";
    const cantidad = item.cantidadProducto || 0;
    const precio = item.precioProducto?.$numberDecimal
      ? parseFloat(item.precioProducto.$numberDecimal)
      : item.precioProducto || 0;
    const total = item.total?.$numberDecimal
      ? parseFloat(item.total.$numberDecimal)
      : item.total || 0;

    doc.text(referencia, 15, y);
    doc.text(descripcion, 40, y);
    doc.text(String(cantidad), 110, y);
    doc.text(precio.toFixed(2), 130, y);
    doc.text(total.toFixed(2), 165, y);
    y += 6;
  });

  y += 6;
  doc.setFontSize(11);
  doc.text(`Subtotal: $${formatDecimal(factura.subtotal)}`, 140, y);
  y += 6;
  doc.text(`Descuento: $${formatDecimal(factura.descuento)}`, 140, y);
  y += 6;
  doc.text(`IVA: $${formatDecimal(factura.iva)}`, 140, y);
  y += 6;
  doc.setFontSize(13);
  doc.text(`TOTAL: $${formatDecimal(factura.total)}`, 140, y);

  window.open(doc.output("bloburl"), "_blank");
};

/* ================= COMPONENTE ================= */
const Factura = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const [facturas, setFacturas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const toggleSidebar = () => setIsOpen(!isOpen);

  /* ================= AUTH ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, [navigate]);

  /* ================= DATA ================= */
  useEffect(() => {
    cargarFacturas();
  }, []);

  const cargarFacturas = async () => {
    setIsLoading(true);
    try {
      const res = await crud.GET("/api/factura");
      setFacturas(Array.isArray(res) ? res : []);
    } catch (error) {
      Swal.fire("Error", "No se pudieron cargar las facturas", "error");
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= FILTRO ================= */
  const facturasFiltradas = facturas.filter((f) => {
    const search = busqueda.toLowerCase();
    return (
      f.numeroFactura?.toLowerCase().includes(search) ||
      f.cliente?.nit?.toLowerCase().includes(search)
    );
  });

  /* ================= UI ================= */
  return (
    <div className="bg-green-300 min-h-screen flex">
      <SidebarAdmin isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <main
        className={`flex-1 p-6 transition-all duration-300 ${
          isOpen ? "ml-48" : "ml-20"
        }`}
      >
        <h1 className="text-black text-center text-xl font-extrabold tracking-widest mb-6">
          GESTIÓN DE FACTURAS
        </h1>

        {/* BOTÓN MODAL */}
        <button
          className="my-4 flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-bold shadow"
          onClick={() => FacturaModal(() => cargarFacturas())}
        >
          Nueva Factura
        </button>

        {/* BUSCADOR */}
        <input
          type="text"
          placeholder="Buscar por N° de factura o NIT"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="text-black mb-4 p-2 w-full rounded"
        />

        {isLoading ? (
          <p className="text-center">Cargando facturas...</p>
        ) : facturasFiltradas.length === 0 ? (
          <p className="text-center text-gray-700">
            No se encontraron resultados.
          </p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <div className="text-black grid grid-cols-6 gap-2 px-4 py-3 font-bold border-b">
              <div>Fecha</div>
              <div>N° Factura</div>
              <div>Cliente</div>
              <div>Subtotal</div>
              <div>Total</div>
              <div>PDF</div>
            </div>

            {facturasFiltradas.map((factura) => (
              <div
                key={factura._id}
                className="text-black grid grid-cols-6 gap-2 px-4 py-2 border-b text-sm items-center"
              >
                <div>{formatearFecha(factura.createdAt)}</div>
                <div>{factura.numeroFactura}</div>
                <div>{factura.cliente?.nombre || "-"}</div>
                <div>${formatDecimal(factura.subtotal)}</div>
                <div>${formatDecimal(factura.total)}</div>
                <div>
                  <button
                    className="my-4 flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-bold shadow"
                    onClick={() => FacturaModal(cargarFacturas)}
                  >
                    Nueva Factura
                  </button>

                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Factura;
