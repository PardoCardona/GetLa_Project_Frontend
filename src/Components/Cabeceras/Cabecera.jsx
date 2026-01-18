import React, { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import crud from "../../conexiones/crud";
import SidebarAdmin from "../Sidebar/SidebarAdmin";
import CabeceraModal from "./CabeceraModal";
import CrearCabeceraModal from "./CrearCabeceraModal";

const Cabecera = () => {
  const navigate = useNavigate();

  /* ===============================
     ESTADOS
  =============================== */
  const [cabeceras, setCabeceras] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const [selectedCabecera, setSelectedCabecera] = useState(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);

  /* SIDEBAR (MISMO PATRÓN ADMIN) */
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);
  const toggleSidebar = () => setIsOpenSidebar(!isOpenSidebar);

  /* ===============================
     AUTENTICACIÓN
  =============================== */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, [navigate]);

  /* ===============================
     CARGAR CABECERAS
  =============================== */
  const fetchCabeceras = async () => {
    setIsLoading(true);
    try {
      const response = await crud.GET("/api/cabecera");

      // IMPORTANTE: tu crud devuelve el array directamente
      setCabeceras(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error al cargar cabeceras", error);
      setCabeceras([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCabeceras();
  }, []);

  /* ===============================
     FILTRO
  =============================== */
  const cabecerasFiltradas = cabeceras.filter((cabecera) =>
    String(cabecera.nit || "")
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  return (
    <div className="bg-green-100 min-h-screen flex">
      {/* SIDEBAR */}
      <SidebarAdmin isOpen={isOpenSidebar} toggleSidebar={toggleSidebar} />

      {/* CONTENIDO PRINCIPAL */}
      <main
        className={`flex-1 bg-green-300 p-4 sm:p-6 transition-all duration-300 ${
          isOpenSidebar ? "ml-48" : "ml-20"
        }`}
      >
        <div className="max-w-7xl mx-auto bg-green-200 rounded-lg">
          {/* HEADER */}
          <div className="px-4 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <h1 className="text-gray-800 font-bold text-lg md:text-xl">
              GESTIÓN DE CABECERAS
            </h1>

            <button
              onClick={() => setOpenCreateModal(true)}
              className="flex items-center gap-2 bg-green-400 hover:bg-green-600 text-gray-900 font-bold px-4 py-2 rounded-xl"
            >
              Agregar Cabecera
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>

          {/* BUSCADOR */}
          <div className="p-4">
            <input
              type="text"
              className="w-full md:w-96 pl-4 pr-4 py-2 outline-none text-green-900 border rounded-md shadow"
              placeholder="Buscar por NIT"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {/* TABLA */}
          <div className="px-4 pb-6">
            <div className="bg-white rounded-lg shadow-sm w-full overflow-x-auto">
              {/* HEADER TABLA */}
              <div className="grid grid-cols-[repeat(6,minmax(140px,1fr))] px-4 py-3 border-b font-semibold text-gray-700 text-center">
                <div>Sucursal</div>
                <div>NIT</div>
                <div>Dirección</div>
                <div>Teléfono</div>
                <div>Email</div>
                <div>Acciones</div>
              </div>

              {/* CUERPO TABLA */}
              {isLoading ? (
                <div className="p-4 text-center text-gray-600">
                  Cargando cabeceras...
                </div>
              ) : cabecerasFiltradas.length > 0 ? (
                cabecerasFiltradas.map((cabecera) => (
                  <div
                    key={cabecera._id}
                    className="grid grid-cols-[repeat(6,minmax(140px,1fr))] px-4 py-3 border-b text-gray-600 text-center items-center"
                  >
                    <div>{cabecera.local}</div>
                    <div>{cabecera.nit}</div>
                    <div className="truncate">{cabecera.direccion}</div>
                    <div>{cabecera.telefono}</div>
                    <div className="truncate">{cabecera.email}</div>

                    <button
                      className="text-blue-500 hover:bg-gray-100 p-2 rounded-full mx-auto"
                      onClick={() => setSelectedCabecera(cabecera)}
                    >
                      <Settings size={18} />
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

      {/* MODAL CREAR */}
      {openCreateModal && (
        <CrearCabeceraModal
          onClose={() => setOpenCreateModal(false)}
          actualizarCabeceras={fetchCabeceras}
        />
      )}

      {/* MODAL EDITAR */}
      {selectedCabecera && (
        <CabeceraModal
          isOpen={!!selectedCabecera}
          cabeceraSeleccionada={selectedCabecera}
          onClose={() => setSelectedCabecera(null)}
          actualizarCabeceras={fetchCabeceras}
        />
      )}
    </div>
  );
};

export default Cabecera;
