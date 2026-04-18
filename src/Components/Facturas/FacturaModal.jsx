import React, { useEffect, useState, useMemo } from "react";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import crud from "../../conexiones/crud";

const getAuthToken = () => localStorage.getItem("token");

const filtrarProductosPorRol = (productos, rol) => {
  if (rol === "admin") return productos;
  return productos.filter((p) => p.estado === "OK");
};

const FacturaModal = ({
  isOpen,
  onClose,
  onFacturaCreada,
  usuarioRol,
  usuarioNombre,
}) => {
  const token = getAuthToken();
  const [sucursales, setSucursales] = useState([]);
  const [cabeceraSeleccionada, setCabeceraSeleccionada] = useState(null);

  const [cliente, setCliente] = useState({
    _id: null,
    nombre: "",
    nit: "",
    direccion: "",
    ciudad: "",
    telefono: "",
  });
  const [clientesSugeridos, setClientesSugeridos] = useState([]);

  const [productosDB, setProductosDB] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [busquedaProd, setBusquedaProd] = useState("");
  const [productosSugeridos, setProductosSugeridos] = useState([]);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      cargarSucursales();
      cargarProductos();
    }
  }, [isOpen]);

  const cargarSucursales = async () => {
    try {
      const res = await crud.GET("/api/cabecera");

      setSucursales(Array.isArray(res) ? res : []);
    } catch (error) {
      Swal.fire("Error", "No se pudieron cargar las sucursales", "error");
    }
  };

  const cargarProductos = async () => {
    try {
      const [resAseo, resDotacion, resRepuestos] = await Promise.all([
        crud.GET("/api/productos-aseo"),
        crud.GET("/api/productos-dotacion"),
        crud.GET("/api/productos-repuestos"),
      ]);

      let productos = [
        ...(resAseo.productos || []),
        ...(resDotacion.productos || []),
        ...(resRepuestos.productos || []),
      ];

      productos = productos.map((p) => ({
        ...p,
        categoria: p.categoriaId?.nombre || "Sin categoría",
        precioVenta: p.precio,
      }));

      setProductosDB(productos);
    } catch (error) {
      Swal.fire("Error", "No se pudieron cargar los productos", "error");
    }
  };

  // -------------------- Clientes: autocompletado y selección --------------------
  useEffect(() => {
    const delay = setTimeout(() => {
      const query = cliente.nombre || cliente.nit;
      if (!query.trim()) {
        setClientesSugeridos([]);
        return;
      }
      buscarClientes(query);
    }, 300);
    return () => clearTimeout(delay);
  }, [cliente.nombre, cliente.nit]);

  const buscarClientes = async (query) => {
    try {
      const res = await crud.GET(`/api/clientes/buscar?query=${query}`);

      setClientesSugeridos(res?.clientes || []);
    } catch (error) {
      setClientesSugeridos([]);
    }
  };

  const seleccionarCliente = (c) => {
    setCliente({
      _id: c._id,
      nombre: c.nombre,
      nit: c.nit,
      direccion: c.direccion,
      ciudad: c.ciudad,
      telefono: c.telefono,
    });
    setClientesSugeridos([]);
  };

  // -------------------- Productos: autocompletado y selección --------------------
  useEffect(() => {
    const delay = setTimeout(() => {
      if (!busquedaProd.trim()) {
        setProductosSugeridos([]);
        return;
      }
      const filtrados = productosDB
        .filter((p) => {
          const nombreMatch = p.nombre
            .toLowerCase()
            .includes(busquedaProd.toLowerCase());
          const refMatch = (p.referencia || "")
            .toLowerCase()
            .includes(busquedaProd.toLowerCase());
          const rolMatch = filtrarProductosPorRol([p], usuarioRol).length > 0;
          return (nombreMatch || refMatch) && rolMatch;
        })
        .slice(0, 10);
      setProductosSugeridos(filtrados);
    }, 300);

    return () => clearTimeout(delay);
  }, [busquedaProd, productosDB, usuarioRol]);

  const seleccionarProducto = (producto) => {
    if (productosSeleccionados.find((p) => p._id === producto._id)) {
      Swal.fire("Producto ya agregado", "", "warning");
      return;
    }
    setProductosSeleccionados((prev) => [
      ...prev,
      { ...producto, cantidad: 1, descuento: 0, iva: 0 },
    ]);
    setBusquedaProd("");
    setProductosSugeridos([]);
  };

  const actualizarProducto = (id, campo, valor) => {
    setProductosSeleccionados((prev) =>
      prev.map((p) => (p._id !== id ? p : { ...p, [campo]: Number(valor) })),
    );
  };

  const eliminarProducto = (id) => {
    setProductosSeleccionados((prev) => prev.filter((p) => p._id !== id));
  };

  // -------------------- Cálculos de totales --------------------
  const { subtotal, descuentoTotal, ivaTotal, total } = useMemo(() => {
    let subtotal = 0,
      descuentoTotal = 0,
      ivaTotal = 0,
      total = 0;

    productosSeleccionados.forEach((p) => {
      const base = p.precioVenta * p.cantidad;
      const desc = base * (p.descuento / 100);
      const baseDesc = base - desc;
      const ivaCalc = 0;
      const totalProd = baseDesc + ivaCalc;

      subtotal += base;
      descuentoTotal += desc;
      ivaTotal += ivaCalc;
      total += totalProd;
    });

    return { subtotal, descuentoTotal, ivaTotal, total };
  }, [productosSeleccionados]);

  // -------------------- Crear Factura --------------------
  const crearFactura = async () => {
    if (!cabeceraSeleccionada)
      return Swal.fire("Seleccione una sucursal", "", "warning");

    if (
      !cliente.nombre ||
      !cliente.nit ||
      !cliente.direccion ||
      !cliente.ciudad ||
      !cliente.telefono
    )
      return Swal.fire(
        "Datos cliente incompletos",
        "Debe ingresar NIT, nombre, dirección, ciudad y teléfono.",
        "warning",
      );

    if (!productosSeleccionados.length)
      return Swal.fire("Agregue productos", "", "warning");

    setIsSaving(true);

    try {
      const clientePayload = cliente._id
        ? cliente._id
        : {
            nombre: cliente.nombre,
            nit: cliente.nit,
            direccion: cliente.direccion,
            ciudad: cliente.ciudad,
            telefono: cliente.telefono,
          };

      const productosFormateados = productosSeleccionados.map((p) => {
        const base = p.precioVenta * p.cantidad;
        const desc = base * (p.descuento / 100);
        const baseDesc = base - desc;
        const totalProd = baseDesc;

        return {
          producto: p._id,
          referencia: p.referencia,
          descripcion: p.nombre,
          cantidad: p.cantidad,
          precio: p.precioVenta,
          descuento: p.descuento,
          iva: 0,
          subtotal: baseDesc,
          total: totalProd,
        };
      });

      console.log("📦 Datos que se enviarán al backend:", {
        cliente: clientePayload,
        cabecera: cabeceraSeleccionada._id,
        productos: productosFormateados,
        subtotal,
        descuento: descuentoTotal,
        iva: ivaTotal,
        total,
        //usuarioNombre,
        //usuarioRol,
      });

      const resFactura = await crud.POST("/api/factura", {
        cliente: clientePayload,
        cabecera: cabeceraSeleccionada._id,
        productos: productosFormateados,
        subtotal,
        descuento: descuentoTotal,
        iva: 0,
        total,
      });

      console.log("FACTURA RECIBIDA:", resFactura);

      // 🔥 VALIDAR RESPUESTA
      if (!resFactura.ok) {
        Swal.fire(
          "Error",
          resFactura.msg || "No se pudo crear la factura",
          "error",
        );
        return;
      }
      await generarPDF(resFactura.factura);
      //await generarPDF(resFactura.factura, usuarioNombre, usuarioRol);

      Swal.fire("Factura creada correctamente", "", "success");

      limpiarFormulario();
      onFacturaCreada?.();
      onClose?.();
    } catch (error) {
      console.error("ERROR COMPLETO:", error);
      console.error("RESPUESTA BACKEND:", error.response?.data);

      Swal.fire(
        "Error",
        error.response?.data?.msg ||
          error.message ||
          "No se pudo crear la factura",
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const limpiarFormulario = () => {
    setCliente({
      _id: null,
      nombre: "",
      nit: "",
      direccion: "",
      ciudad: "",
      telefono: "",
    });
    setProductosSeleccionados([]);
    setCabeceraSeleccionada(null);
    setBusquedaProd("");
    setClientesSugeridos([]);
    setProductosSugeridos([]);
  };

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

  // -------------------- Generar PDF --------------------
  const generarPDF = async (factura) => {
    const toNum = (v) => parseFloat(v?.$numberDecimal ?? v ?? 0);
    const fechaHoy = factura.createdAt
      ? new Date(factura.createdAt).toLocaleDateString("es-CO")
      : new Date().toLocaleDateString("es-CO");

    // ✅ Declarado UNA sola vez
    const dependenciaPorRol = {
      admin: "Administración",
      adminrep: "Almacen de repuestos",
      adminlimp: "Almacen de insumos",
      admindot: "Almacen de dotación",
    };
    const dependencia =
      dependenciaPorRol[factura.rolUsuario] || factura.cabecera?.local || "";

    const doc = new jsPDF();

    // ─── LOGO ────────────────────────────────────────────────────────────────────
    try {
      const logoBase64 = await cargarImagenBase64("/LOGOS-GREEN-ENERGY.png");
      doc.addImage(logoBase64, "PNG", 75, 8, 60, 18);
    } catch (e) {
      console.warn("No se pudo cargar el logo:", e);
    }

    // ─── DATOS EMPRESA (desde cabecera) ─────────────────────────────────────────
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(`Nit: ${factura.cabecera?.nit || ""}`, 105, 30, {
      align: "center",
    });
    doc.text(`Dirección: ${factura.cabecera?.direccion || ""}`, 105, 35, {
      align: "center",
    });
    doc.text(`Teléfono: ${factura.cabecera?.telefono || ""}`, 105, 40, {
      align: "center",
    });
    doc.text(`Email: ${factura.cabecera?.email || ""}`, 105, 45, {
      align: "center",
    });

    // ─── TÍTULO ──────────────────────────────────────────────────────────────────
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("EGRESO DE BIENES DEL ALMACEN", 105, 57, { align: "center" });

    // ─── DATOS ENCABEZADO ────────────────────────────────────────────────────────
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

    // ─── TABLA DE PRODUCTOS ──────────────────────────────────────────────────────
    const cuerpoFormateado = factura.cuerpo.map((p) => ({
      referencia: p.referenciaProducto,
      descripcion: p.descripcionProducto,
      cantidad: p.cantidadProducto,
    }));

    autoTable(doc, {
      startY: y + 4,
      head: [["Item", "Referencia", "Nombre", "Cantidad"]],
      body: cuerpoFormateado.map((p, i) => [
        i + 1,
        p.referencia,
        p.descripcion,
        p.cantidad,
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

    // ─── FIRMA ───────────────────────────────────────────────────────────────────
    const firmaY = doc.lastAutoTable.finalY + 40;
    const firmaX = 105;

    doc.setDrawColor(0, 0, 0);
    doc.line(firmaX - 40, firmaY, firmaX + 40, firmaY);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Recibe: ", firmaX - 5, firmaY + 7, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text(factura.cliente?.nombre || "", firmaX - 4, firmaY + 7);

    doc.output("dataurlnewwindow");
    //window.open(doc.output("bloburl"), "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed text-green-900 inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-green-200 w-11/12 max-w-6xl rounded-xl p-6 shadow-xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-4">Nueva Factura</h2>

        {/* SUCURSAL */}
        <h3 className="font-semibold mb-2">Sucursal</h3>
        <select
          value={cabeceraSeleccionada?._id || ""}
          onChange={(e) => {
            const suc = sucursales.find((s) => s._id === e.target.value);
            setCabeceraSeleccionada(suc || null);
          }}
          className="border p-2 rounded w-full mb-6"
        >
          <option value="">Seleccione una sucursal</option>
          {sucursales.map((s) => (
            <option key={s._id} value={s._id}>
              {s.local} - {s.direccion}
            </option>
          ))}
        </select>

        {/* CLIENTE */}
        <h3 className="font-semibold mb-2">Cliente</h3>
        <div className="grid grid-cols-2 gap-4 mb-2 relative">
          {["nombre", "nit", "direccion", "ciudad", "telefono"].map((campo) => (
            <input
              key={campo}
              placeholder={campo.toUpperCase()}
              value={cliente[campo]}
              onChange={(e) =>
                setCliente({ ...cliente, _id: null, [campo]: e.target.value })
              }
              className="border p-2 rounded"
            />
          ))}

          {clientesSugeridos.length > 0 && (
            <ul className="absolute top-full left-0 right-0 bg-white border rounded max-h-40 overflow-y-auto z-50">
              {clientesSugeridos.map((c) => (
                <li
                  key={c._id}
                  className="p-2 hover:bg-green-100 cursor-pointer"
                  onClick={() => seleccionarCliente(c)}
                >
                  {c.nombre} ({c.nit})
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* PRODUCTOS */}
        <h3 className="font-semibold mb-2">Buscar Productos</h3>
        <input
          type="text"
          placeholder="Buscar por nombre o referencia"
          value={busquedaProd}
          onChange={(e) => setBusquedaProd(e.target.value)}
          className="border p-2 rounded w-full mb-2"
        />

        {productosSugeridos.length > 0 && (
          <ul className="absolute z-50 max-h-40 overflow-y-auto border rounded bg-white w-full">
            {productosSugeridos.map((p) => (
              <li
                key={p._id}
                onClick={() => seleccionarProducto(p)}
                className="p-2 hover:bg-green-100 cursor-pointer text-sm"
              >
                {p.referencia} | {p.nombre} | Stock: {p.stock} | $
                {p.precioVenta}
              </li>
            ))}
          </ul>
        )}

        {/* TABLA PRODUCTOS */}
        <table className="w-full border text-sm mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Cant</th>
              <th>Precio</th>   
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {productosSeleccionados.map((p) => {
              const base = p.precioVenta * p.cantidad;
              const desc = 0;
              const baseDesc = base - desc;
              const totalProd = baseDesc;
              return (
                <tr key={p._id} className="text-center border-t">
                  <td>{p.referencia}</td>
                  <td>{p.nombre}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      max={p.stock}
                      value={p.cantidad}
                      onChange={(e) =>
                        actualizarProducto(p._id, "cantidad", e.target.value)
                      }
                      className="w-16 border rounded text-center"
                    />
                  </td>
                  <td>{p.precioVenta}</td>
                  

                  <td>${totalProd.toFixed(2)}</td>
                  <td>
                    <button
                      onClick={() => eliminarProducto(p._id)}
                      className="text-red-500"
                    >
                      X
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* TOTALES */}
        <div className="text-right space-y-1 mb-4 font-semibold">
          <p>Subtotal: ${subtotal.toFixed(2)}</p>
          

          <p className="text-lg text-green-600">TOTAL: ${total.toFixed(2)}</p>
        </div>

        {/* BOTONES */}
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
            Cancelar
          </button>
          <button
            disabled={isSaving}
            onClick={crearFactura}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            {isSaving ? "Guardando..." : "Guardar Factura"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacturaModal;
