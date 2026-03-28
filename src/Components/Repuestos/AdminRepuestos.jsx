import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarAdmin from "../Sidebar/SidebarAdmin";
import { MdCategory } from "react-icons/md";
import Swal from "sweetalert2";
import crud from "../../conexiones/crud";
import FacturaModal from "../Facturas/FacturaModal";

const Repuestos = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Sidebar
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  // Categorías
  const [categorias, setCategorias] = useState([]);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [categoriaEdit, setCategoriaEdit] = useState(null);

  // Factura Modal
  const [isModalFacturaOpen, setIsModalFacturaOpen] = useState(false);

  // Leer usuario logueado
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
  // 📥 CARGAR CATEGORÍAS
  // ---------------------------------------------------
  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      const response = await crud.GET("/api/repuestos");

      if (response?.categorias) {
        setCategorias(response.categorias);
      } else {
        console.log("No se pudieron cargar categorías");
      }
    } catch (error) {
      console.log("Error:", error);
    }
  };

  // -------------------------------------------------------
  // 🗑️ ELIMINAR CATEGORÍA (CORREGIDO)
  // -------------------------------------------------------
  const eliminarCategoria = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar categoría?",
      text: "Esta acción no se puede revertir",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      const response = await crud.DELETE(`/api/repuestos/${id}`);

      // ✅ SOLO ES ERROR SI EL MENSAJE REALMENTE ES ERROR
      if (response?.msg && response.msg.toLowerCase().includes("error")) {
        Swal.fire("Error", response.msg, "error");
        return;
      }

      Swal.fire("Eliminado", "Categoría eliminada correctamente", "success");
      cargarCategorias();
    } catch (error) {
      Swal.fire("Error", "No se pudo conectar con el servidor", "error");
    }
  };

  // -------------------------------------------------------
  // ✏️ MODAL
  // -------------------------------------------------------
  const abrirModal = (categoria) => {
    setCategoriaEdit(categoria);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setCategoriaEdit(null);
  };

  // -------------------------------------------------------
  // 💾 GUARDAR CAMBIOS
  // -------------------------------------------------------
  const guardarCambios = async () => {
    try {
      const result = await crud.PUT(`/api/repuestos/${categoriaEdit._id}`, {
        nombre: categoriaEdit.nombre,
        imagen: categoriaEdit.imagen,
      });

      // 🔥 Validación extra (por si backend responde raro)
      if (!result) {
        throw new Error("Respuesta vacía del servidor");
      }

      // 🔥 Ya NO validamos por msg (porque también viene en éxito)

      Swal.fire(
        "Actualizado",
        result?.msg || "La categoría fue editada correctamente",
        "success",
      );

      cerrarModal();
      cargarCategorias();
    } catch (error) {
      Swal.fire(
        "Error",
        error?.response?.data?.msg || "No se pudo actualizar",
        "error",
      );
    }
  };

  // -------------------------------------------------------
  // 📌 RENDER
  // -------------------------------------------------------
  const handleCrearCategoria = () => {
    navigate("/AdminRepuestos/categorias");
  };

  return (
    <div className="bg-gray-100 min-h-screen flex">
      <SidebarAdmin isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <main
        className={`flex-1 bg-green-300 p-2 sm:p-6 transition-all duration-300 ${
          isOpen ? "ml-48" : "ml-20"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="relative mb-6 flex flex-col items-center min-h-24 justify-center">
            <p className="text-lime-900 font-bold text-2xl sm:text-3xl text-center italic">
              Lista Categorías de Repuestos
            </p>

            <div className="flex flex-col gap-2 sm:absolute sm:right-0 sm:top-0 sm:py-2">
              <button
                onClick={() => setIsModalFacturaOpen(true)}
                className="mt-3 sm:mt-0 w-full sm:w-auto flex items-center justify-center
                            gap-2 text-white bg-blue-500 px-4 py-2 rounded-2xl hover:bg-blue-600"
              >
                🧾 Nueva Factura
              </button>

              <button
                onClick={handleCrearCategoria}
                className="mt-3 sm:mt-0 w-full sm:w-auto flex items-center justify-center
                            gap-2 text-green-800 bg-green-500 px-4 py-2 rounded-2xl hover:bg-green-600"
              >
                <MdCategory size={20} />
                Crear Categoría
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-6">
            {categorias.length === 0 ? (
              <p className="col-span-full text-center text-gray-700">
                No hay categorías registradas.
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
                    className="h-40 object-contain mb-3 rounded-2xl"
                  />

                  <p className="font-bold text-lg text-green-900">
                    {cat.nombre}
                  </p>

                  <div className="flex gap-2 mt-3 flex-wrap justify-center">
                    <button
                      className="w-24 h-9 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-700"
                      onClick={() => abrirModal(cat)}
                    >
                      ✏️ Editar
                    </button>

                    <button
                      className="w-26 h-9 bg-red-500 text-white text-sm rounded-lg hover:bg-red-700"
                      onClick={() => eliminarCategoria(cat._id)}
                    >
                      🗑️ Eliminar
                    </button>

                    <button
                      className="w-32 h-9 bg-green-700 text-white text-sm rounded-lg hover:bg-green-800"
                      onClick={() =>
                        navigate(`/AdminRepuestos/lista/${cat._id}`)
                      }
                    >
                      ⚙️ Repuestos
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-zinc-100/70 flex justify-center items-center z-50">
          <div className="bg-green-500 p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-center text-lg font-bold mb-4 text-black">
              Editar Categoría
            </h2>

            <label className="font-semibold text-sm text-black">Nombre</label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg mb-3 text-black"
              value={categoriaEdit.nombre}
              onChange={(e) =>
                setCategoriaEdit({ ...categoriaEdit, nombre: e.target.value })
              }
            />

            <label className="font-semibold text-sm text-black">
              URL Imagen
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg mb-4 text-black"
              value={categoriaEdit.imagen}
              onChange={(e) =>
                setCategoriaEdit({ ...categoriaEdit, imagen: e.target.value })
              }
            />

            <div className="flex justify-center gap-3">
              <button
                onClick={cerrarModal}
                className="px-4 py-2 bg-green-300 rounded-lg hover:bg-green-600 text-black font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={guardarCambios}
                className="px-4 py-2 bg-green-300 text-black font-semibold rounded-lg hover:bg-green-600"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal de Nueva Factura */}
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

export default Repuestos;
