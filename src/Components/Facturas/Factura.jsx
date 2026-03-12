import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarAdmin from "../Sidebar/SidebarAdmin";
import FacturaModal from "./FacturaModal";
import crud from "../../conexiones/crud";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ import agregado

/* ================= UTILIDADES ================= */

const formatearFecha = (fecha) => {
  if (!fecha) return "";
  return new Date(fecha).toLocaleString("es-CL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDecimal = (valor) => {
  if (valor === undefined || valor === null) return "0.00";
  if (typeof valor === "object" && valor.$numberDecimal) {
    return parseFloat(valor.$numberDecimal).toFixed(2);
  }
  return parseFloat(valor).toFixed(2);
};

/* ================= LOGO EN BASE64 ================= */

const cargarImagenBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });
};

/* ================= PDF (mismo formato que FacturaModal) ================= */

const generarPDF = async (factura) => {
  // ✅ Leer usuario del localStorage
  

  const toNum = (v) => parseFloat(v?.$numberDecimal ?? v ?? 0);
  const fechaHoy = new Date().toLocaleDateString("es-CO");

  // ✅ Mapa de roles a dependencias
  const dependenciaPorRol = {
    admin: "Administración",
    adminrep: "Almacen de repuestos",
    adminlimp: "Almacen de insumos",
    admindot: "Almacen de dotación",
  };
  const dependencia =
  dependenciaPorRol[factura.rolUsuario] || factura.cabecera?.local || "";

  const doc = new jsPDF();

  // ─── LOGO ──────────────────────────────────────────────────────────────────
  try {
    const logoBase64 = await cargarImagenBase64("/LOGOS-GREEN-ENERGY.png");
    doc.addImage(logoBase64, "PNG", 75, 8, 60, 18);
  } catch (e) {
    console.warn("No se pudo cargar el logo:", e);
  }

  // ─── DATOS EMPRESA (desde cabecera) ────────────────────────────────────────
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`Nit: ${factura.cabecera?.nit || ""}`, 105, 30, { align: "center" });
  doc.text(`Dirección: ${factura.cabecera?.direccion || ""}`, 105, 35, {
    align: "center",
  });
  doc.text(`Teléfono: ${factura.cabecera?.telefono || ""}`, 105, 40, {
    align: "center",
  });
  doc.text(`Email: ${factura.cabecera?.email || ""}`, 105, 45, {
    align: "center",
  });

  // ─── TÍTULO ────────────────────────────────────────────────────────────────
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("EGRESO DE BIENES DEL ALMACEN", 105, 57, { align: "center" });

  // ─── DATOS ENCABEZADO ──────────────────────────────────────────────────────
  doc.setFontSize(10);
  const col1X = 20;
  const col2X = 60;
  let y = 69;

  const fila = (label, valor) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, col1X, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(valor || ""), col2X, y);
    y += 7;
  };

  fila("Entrega:", factura.nombreUsuario || "");
  fila("Dependencia:", dependencia);
  fila("Recibe:", factura.cliente?.nombre || "");
  fila("Fecha:", fechaHoy);
  fila("Formato No.:", factura.numeroFactura || "");

  // ─── TABLA DE PRODUCTOS ────────────────────────────────────────────────────
  autoTable(doc, {
    startY: y + 4,
    head: [["Item", "Referencia", "Nombre", "Cantidad"]],
    body: (factura.cuerpo || []).map((p, i) => [
      i + 1,
      p.referenciaProducto || "",
      p.descripcionProducto || "",
      p.cantidadProducto,
    ]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      lineWidth: 0.3,
      lineColor: [0, 0, 0],
      halign: "center",
    },
    bodyStyles: {
      lineWidth: 0.3,
      lineColor: [0, 0, 0],
      textColor: [0, 0, 0],
    },
    columnStyles: {
      0: { cellWidth: 15, halign: "center" },
      1: { cellWidth: 35, halign: "center" },
      2: { cellWidth: 110 },
      3: { cellWidth: 25, halign: "center" },
    },
    theme: "plain",
  });

  // ─── FIRMA ─────────────────────────────────────────────────────────────────
  const firmaY = doc.lastAutoTable.finalY + 40;
  const firmaX = 105;

  doc.setDrawColor(0, 0, 0);
  doc.line(firmaX - 40, firmaY, firmaX + 40, firmaY);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Recibe: ", firmaX - 5, firmaY + 7, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.text(factura.cliente?.nombre || "", firmaX - 4, firmaY + 7);

  doc.save(`Factura_${factura.numeroFactura || Date.now()}.pdf`);
};

/* ================= COMPONENTE ================= */

const Factura = () => {
  const navigate = useNavigate();

  const [facturas, setFacturas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ Leer usuario logueado del localStorage
  const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "{}");
  const usuarioNombre = usuarioGuardado?.nombre || "";
  const usuarioRol = usuarioGuardado?.rol || "";

  const toggleSidebar = () => setIsOpenSidebar(!isOpenSidebar);

  /* ================= AUTH ================= */

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, [navigate]);

  /* ================= DATA ================= */

  const fetchFacturas = async () => {
    setIsLoading(true);
    try {
      const res = await crud.GET("/api/factura");
      const data = res?.facturas || [];
      setFacturas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando facturas:", error);
      Swal.fire("Error", "No se pudieron cargar las facturas", "error");
      setFacturas([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFacturas();
  }, []);

  /* ================= FILTRO ================= */

  const facturasFiltradas = facturas.filter(
    (f) =>
      String(f.numeroFactura || "")
        .toLowerCase()
        .includes(busqueda.toLowerCase()) ||
      String(f.cliente?.nit || "")
        .toLowerCase()
        .includes(busqueda.toLowerCase()),
  );

  /* ================= UI ================= */

  return (
    <div className="min-h-screen flex">
      <SidebarAdmin isOpen={isOpenSidebar} toggleSidebar={toggleSidebar} />

      <main
        className={`flex-1 bg-green-300 p-4 sm:p-6 transition-all duration-300 ${
          isOpenSidebar ? "ml-48" : "ml-20"
        }`}
      >
        <div className="max-w-7xl mx-auto bg-green-200 rounded-lg">
          {/* HEADER */}
          <div className="px-4 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <h1 className="text-gray-800 font-bold text-lg md:text-xl">
              GESTIÓN DE FACTURAS
            </h1>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                className="w-full md:w-96 pl-4 pr-4 py-2 outline-none text-green-900 border rounded-md shadow"
                placeholder="Buscar por N° de factura o NIT"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />

              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-green-400 hover:bg-green-600 text-gray-900 font-bold px-4 py-2 rounded-xl"
              >
                Nueva Factura
              </button>
            </div>
          </div>

          {/* TABLA */}
          <div className="px-4 pb-6">
            <div className="bg-white rounded-lg shadow-sm w-full overflow-x-auto">
              <div className="grid grid-cols-[repeat(6,minmax(140px,1fr))] px-4 py-3 border-b font-semibold text-gray-700 text-center">
                <div>Fecha</div>
                <div>N° Factura</div>
                <div>Cliente</div>
                <div>Subtotal</div>
                <div>Total</div>
                <div>PDF</div>
              </div>

              {isLoading ? (
                <div className="p-4 text-center text-gray-600">
                  Cargando facturas...
                </div>
              ) : facturasFiltradas.length > 0 ? (
                facturasFiltradas.map((factura) => (
                  <div
                    key={factura._id}
                    className="grid grid-cols-[repeat(6,minmax(140px,1fr))] px-4 py-3 border-b text-gray-600 text-center items-center"
                  >
                    <div>{formatearFecha(factura.createdAt)}</div>
                    <div>{factura.numeroFactura}</div>
                    <div>{factura.cliente?.nombre || "-"}</div>
                    <div>${formatDecimal(factura.subtotal)}</div>
                    <div>${formatDecimal(factura.total)}</div>

                    {/* ✅ onClick usa async generarPDF */}
                    <button
                      className="text-blue-500 hover:bg-gray-100 p-2 rounded-full mx-auto"
                      onClick={() => generarPDF(factura)}
                    >
                      Ver PDF
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-600">
                  No se encontraron resultados
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <FacturaModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchFacturas();
        }}
        onFacturaCreada={fetchFacturas}
        usuarioRol={usuarioRol}
        usuarioNombre={usuarioNombre}
      />
    </div>
  );
};

export default Factura;
