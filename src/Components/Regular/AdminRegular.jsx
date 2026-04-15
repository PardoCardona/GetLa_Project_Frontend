import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarAdmin from "../Sidebar/SidebarAdmin";
import crud from "../../conexiones/crud";
import FacturaModal from "../Facturas/FacturaModal";

const AdminRegular = () => {
  const navigate = useNavigate();

  // 🔐 Auth
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // 📂 Sidebar
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  // 📦 Categorías
  const [categorias, setCategorias] = useState([]);

  // 🧾 Factura Modal
  const [isModalFacturaOpen, setIsModalFacturaOpen] = useState(false);

  // 👤 Usuario
  const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "{}");
  const usuarioNombre = usuarioGuardado?.nombre || "";
  const usuarioRol = usuarioGuardado?.rol || "";

  // ---------------------------------------------------
  // 🔐 AUTENTICACIÓN
  // ---------------------------------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      navigate("/");
    }
  }, [navigate]);

  // ---------------------------------------------------
  // 📥 CARGAR DATOS
  // ---------------------------------------------------
  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      const response = await crud.GET("/api/repuestos");

      if (response?.categorias) {
        setCategorias(response.categorias);
      }
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  };

  // ---------------------------------------------------
  // 🎨 UI
  // ---------------------------------------------------
  return (
    <div className="bg-gray-100 min-h-screen flex">
      <SidebarAdmin isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <main
        className={`flex-1 bg-green-300 p-2 sm:p-6 transition-all duration-300 ${
          isOpen ? "ml-48" : "ml-20"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          {/* HEADER */}
          <div className="relative mb-6 flex flex-col items-center">
            <p className="text-2xl sm:text-3xl font-bold text-green-800 italic text-center">
              Categorías de Repuestos
            </p>

            {/* 🟡 Indicador de rol */}
            <p className="mt-2 text-xs text-gray-700 italic">
              Modo Supervisor (solo lectura)
            </p>

            <div className="flex flex-col gap-2 sm:absolute sm:right-0 sm:top-0">
              <button
                onClick={() => setIsModalFacturaOpen(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600"
              >
                🧾 Nueva Factura
              </button>
            </div>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {categorias.length === 0 ? (
              <p className="col-span-full text-center text-gray-600">
                No hay categorías registradas
              </p>
            ) : (
              categorias.map((cat) => (
                <div
                  key={cat._id}
                  className="bg-green-200 shadow-md rounded-xl p-4 flex flex-col items-center border border-green-200"
                >
                  <img
                    src={cat.imagen}
                    alt={cat.nombre}
                    className="h-40 object-contain mb-3"
                  />

                  <p className="font-bold text-green-800">{cat.nombre}</p>

                  <button
                    onClick={() => navigate(`/regular/repuestos/${cat._id}`)}
                    className="mt-3 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800"
                  >
                    Ver Repuestos
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* FACTURA */}
      <FacturaModal
        isOpen={isModalFacturaOpen}
        onClose={() => setIsModalFacturaOpen(false)}
        onFacturaCreada={() => {}}
        usuarioRol={usuarioRol}
        usuarioNombre={usuarioNombre}
      />
    </div>
  );
};

export default AdminRegular;
