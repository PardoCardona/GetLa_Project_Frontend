import React, { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import Swal from "sweetalert2";
import SidebarAdmin from "../Sidebar/SidebarAdmin";
import crud from "../../conexiones/crud";
import ClienteModal from "./ClienteModal";

const ClientesPage = () => {
  const [clientes, setClientes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  // Sidebar
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);
  const toggleSidebar = () => setIsOpenSidebar(!isOpenSidebar);

  /* ================================
     SweetAlert2
  ================================ */
  const alertError = (title, text) =>
    Swal.fire({ icon: "error", title, text, confirmButtonColor: "#dc2626" });

  const alertWarning = (title, text) =>
    Swal.fire({ icon: "warning", title, text, confirmButtonColor: "#f59e0b" });

  /* ================================
     Cargar clientes
  ================================ */
  const cargarClientes = async () => {
    setIsLoading(true);
    try {
      const response = await crud.GET("/api/clientes");
      if (response?.clientes) {
        setClientes(response.clientes);
      } else {
        alertError("Error", "No se pudieron cargar los clientes");
      }
    } catch (error) {
      alertError("Error", "Ocurrió un error al cargar los clientes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  /* ================================
     Filtrado
  ================================ */
  const clientesFiltrados = clientes.filter((cliente) =>
    String(cliente.nit || "")
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  /* ================================
     Modal
  ================================ */
  const abrirModalCliente = (cliente) => {
    setClienteSeleccionado(cliente); // 👈 ÚNICO control del modal
  };

  const cerrarModalCliente = () => {
    setClienteSeleccionado(null);
  };

  return (
    <div className="bg-green-300 min-h-screen flex">
      <SidebarAdmin isOpen={isOpenSidebar} toggleSidebar={toggleSidebar} />

      <main
        className={`flex-1 p-4 transition-all duration-300 ${
          isOpenSidebar ? "ml-48" : "ml-20"
        }`}
      >
        <div className="max-w-7xl mx-auto bg-green-200 rounded-lg">
          {/* HEADER + BUSCADOR */}
          <div className="px-4 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <h1 className="text-green-800 font-bold text-lg md:text-xl">
              GESTIÓN DE CLIENTES
            </h1>

            <input
              type="text"
              className="w-full md:w-96 px-4 py-2 rounded-md shadow outline-none text-green-900 border"
              placeholder="Buscar por NIT"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !busqueda.trim()) {
                  alertWarning("Campo vacío", "Ingrese un NIT para buscar");
                }
              }}
            />
          </div>

          {/* TABLA */}
          <div className="px-4 pb-6">
            <div className="bg-white rounded-lg shadow-sm w-full overflow-x-auto text-gray-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 px-4 py-3 border-b font-semibold text-center">
                <div>Nombres</div>
                <div>NIT</div>
                <div>Dirección</div>
                <div>Ciudad</div>
                <div>Teléfono</div>
                <div>N° Compras</div>
                <div>Acciones</div>
              </div>

              {isLoading ? (
                <div className="p-4 text-center">Cargando clientes...</div>
              ) : clientesFiltrados.length > 0 ? (
                clientesFiltrados.map((cliente) => (
                  <div
                    key={cliente._id}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 px-4 py-3 border-b text-center items-center"
                  >
                    <div>{cliente.nombre}</div>
                    <div>{cliente.nit}</div>
                    <div className="truncate">{cliente.direccion}</div>
                    <div>{cliente.ciudad}</div>
                    <div>{cliente.telefono}</div>
                    <div>{cliente.numeroCompras}</div>
                    <div>
                      <button
                        onClick={() => abrirModalCliente(cliente)}
                        className="text-blue-500 hover:bg-gray-100 p-2 rounded-full"
                      >
                        <Settings size={18} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center">No hay clientes</div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MODAL */}
      {clienteSeleccionado && (
        <ClienteModal
          clienteState={clienteSeleccionado}
          changeModalCliente={cerrarModalCliente}
          actualizarClientes={cargarClientes}
        />
      )}
    </div>
  );
};

export default ClientesPage;
