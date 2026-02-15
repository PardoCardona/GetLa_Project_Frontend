import Swal from "sweetalert2";
import crud from "../../conexiones/crud";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const getAuthToken = () => localStorage.getItem("token");

/* ================= ESTILOS ================= */
const style = document.createElement("style");
style.innerHTML = `
  .swal-input, .swal-select {
    width: 100%;
    padding: 8px;
    margin-top: 6px;
    border: 1px solid #ccc;
    border-radius: 6px;
  }
  .custom-swal {
    width: 95vw !important;
    max-width: 1100px !important;
  }
`;
document.head.appendChild(style);

/* ================= HELPERS ================= */
const normalizarRespuesta = (res) => {
  // depende de cómo esté tu wrapper "crud"
  // si devuelve axios completo => res.data
  // si devuelve data directo => res
  return res?.data ? res.data : res;
};

const cargarClientes = async (token) => {
  const res = await crud.GET("/api/clientes", {
    headers: { "x-auth-token": token },
  });
  const data = normalizarRespuesta(res);
  return data?.clientes || [];
};

/* ================= MODAL ================= */
const FacturaModal = async (onSuccess = () => {}) => {
  const token = getAuthToken();
  if (!token) {
    Swal.fire("Error", "No hay token de autenticación", "error");
    return;
  }

  let sucursales = [];
  let clientes = [];

  try {
    const resSuc = await crud.GET("/api/cabecera");
    const dataSuc = normalizarRespuesta(resSuc);
    sucursales = Array.isArray(dataSuc) ? dataSuc : [];

    clientes = await cargarClientes(token);
  } catch (e) {
    console.error("Error cargando datos iniciales:", e);
    Swal.fire("Error", "No se pudieron cargar datos iniciales", "error");
    return;
  }

  /* ================= UI ================= */
  const container = document.createElement("div");

  /* ===== Sucursal ===== */
  const selectSucursal = document.createElement("select");
  selectSucursal.className = "swal-select";
  selectSucursal.innerHTML = `<option value="">Seleccione sucursal</option>`;
  sucursales.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s._id;
    opt.textContent = s.local;
    selectSucursal.appendChild(opt);
  });

  /* ===== Cliente SELECT ===== */
  const selectCliente = document.createElement("select");
  selectCliente.className = "swal-select";
  selectCliente.innerHTML = `<option value="">Cliente nuevo / no registrado</option>`;
  clientes.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c._id;
    opt.textContent = `${c.nombre} (${c.nit})`;
    opt.dataset.cliente = JSON.stringify(c);
    selectCliente.appendChild(opt);
  });

  /* ===== Inputs Cliente ===== */
  const clienteNombre = document.createElement("input");
  clienteNombre.placeholder = "Nombre completo";
  clienteNombre.className = "swal-input";

  const clienteNit = document.createElement("input");
  clienteNit.placeholder = "NIT / RUT";
  clienteNit.className = "swal-input";

  const clienteDireccion = document.createElement("input");
  clienteDireccion.placeholder = "Dirección";
  clienteDireccion.className = "swal-input";

  const clienteCiudad = document.createElement("input");
  clienteCiudad.placeholder = "Ciudad";
  clienteCiudad.className = "swal-input";

  const clienteTelefono = document.createElement("input");
  clienteTelefono.placeholder = "Teléfono";
  clienteTelefono.className = "swal-input";

  /* ===== Autollenado ===== */
  selectCliente.addEventListener("change", () => {
    const opt = selectCliente.selectedOptions[0];
    if (!opt || !opt.dataset.cliente) return;

    const c = JSON.parse(opt.dataset.cliente);
    clienteNombre.value = c.nombre || "";
    clienteNit.value = c.nit || "";
    clienteDireccion.value = c.direccion || "";
    clienteCiudad.value = c.ciudad || "";
    clienteTelefono.value = c.telefono || "";
  });

  container.append(
    selectSucursal,
    selectCliente,
    clienteNombre,
    clienteNit,
    clienteDireccion,
    clienteCiudad,
    clienteTelefono
  );

  /* ================= MODAL ================= */
  const result = await Swal.fire({
    title: "Registrar Factura - GETLA",
    html: container,
    confirmButtonText: "Guardar factura",
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    customClass: { popup: "custom-swal" },
    preConfirm: async () => {
      try {
        if (!selectSucursal.value) {
          Swal.showValidationMessage("Seleccione una sucursal");
          return false;
        }

        if (
          !clienteNombre.value.trim() ||
          !clienteNit.value.trim() ||
          !clienteDireccion.value.trim() ||
          !clienteCiudad.value.trim() ||
          !clienteTelefono.value.trim()
        ) {
          Swal.showValidationMessage("Complete los datos del cliente");
          return false;
        }

        /* ===== BUSCAR O CREAR CLIENTE ===== */
        let clienteId = selectCliente.value || null;
        const nitBuscado = clienteNit.value.toLowerCase().trim();

        if (!clienteId) {
          // 1) Verificar si existe en el listado actual
          const existe = clientes.find(
            (c) => c.nit?.toLowerCase().trim() === nitBuscado
          );

          if (existe) {
            clienteId = existe._id;
          } else {
            // 2) Preguntar si lo crea
            const crear = await Swal.fire({
              title: "Cliente no existe",
              text: "¿Desea crear este cliente?",
              icon: "question",
              showCancelButton: true,
              confirmButtonText: "Sí, crear",
              cancelButtonText: "Cancelar",
            });

            if (!crear.isConfirmed) return false;

            // 3) Crear cliente
            await crud.POST(
              "/api/clientes",
              {
                nombre: clienteNombre.value.trim(),
                nit: clienteNit.value.trim(),
                direccion: clienteDireccion.value.trim(),
                ciudad: clienteCiudad.value.trim(),
                telefono: clienteTelefono.value.trim(),
              },
              {
                headers: { "x-auth-token": token },
              }
            );

            // ✅ 4) SOLUCIÓN REAL: recargar clientes y buscar por nit
            const clientesActualizados = await cargarClientes(token);
            const creado = clientesActualizados.find(
              (c) => c.nit?.toLowerCase().trim() === nitBuscado
            );

            if (!creado?._id) {
              Swal.showValidationMessage(
                "No se pudo confirmar la creación del cliente. Revisa el backend (validación, permisos o error)."
              );
              return false;
            }

            clienteId = creado._id;

            // actualizar select en memoria (opcional)
            clientes = clientesActualizados;
          }
        }

        /* ===== CREAR FACTURA ===== */
        const datosFactura = {
          cabecera: selectSucursal.value,
          cliente: clienteId,
          productos: [],
          subtotal: 0,
          descuento: 0,
          iva: 0,
          total: 0,
        };

        const respFactura = await crud.POST("/api/factura", datosFactura, {
          headers: { "x-auth-token": token },
        });

        return normalizarRespuesta(respFactura);
      } catch (error) {
        console.error("Error en preConfirm:", error);

        const msgBackend =
          error?.response?.data?.msg ||
          error?.response?.data?.message ||
          error?.message ||
          "Error al procesar la solicitud";

        Swal.showValidationMessage(msgBackend);
        return false;
      }
    },
  });

  if (!result.isConfirmed || !result.value?.ok) return;

  /* ================= PDF ================= */
  const factura = result.value.factura;

  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("FACTURA - GETLA", 105, 15, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-CL")}`, 15, 30);
  doc.text(`N° Factura: ${factura.numeroFactura}`, 15, 36);

  autoTable(doc, {
    startY: 50,
    head: [["Producto", "Cantidad", "Precio", "Total"]],
    body: [],
  });

  doc.save(`Factura_${factura.numeroFactura}.pdf`);
  Swal.fire("Éxito", "Factura creada correctamente", "success");
  onSuccess();
};

export default FacturaModal;
