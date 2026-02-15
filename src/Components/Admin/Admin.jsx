import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarAdmin from "../Sidebar/SidebarAdmin";
import { FaUserPlus } from "react-icons/fa";
import FotoUsuario from "../../assets/Juan Carlos Arrieta Bustos.jpg";
import crud from "../../conexiones/crud";
import Swal from "sweetalert2";

const Admin = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Estado del sidebar
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  useEffect(() => {
    const autenticarUsuario = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthenticated(false);
        navigate("/");
      }
    };
    autenticarUsuario();
  }, [navigate]);

  const handleCrearUsuario = () => {
    navigate("/admin/crear-usuario");
  };

  const handleActualizarUsuario = (id) => {
    navigate(`/admin/actualizar-usuario/${id}`);
  };

  const handleEliminarUsuario = async (id) => {
    Swal.fire({
      title: "¿Eliminar usuario?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await crud.DELETE(`/api/usuarios/${id}`);

          Swal.fire("Eliminado", "El usuario ha sido eliminado.", "success");

          // Recargar lista
          cargarUsuarios();
        } catch (error) {
          Swal.fire("Error", "No se pudo eliminar el usuario.", "error");
        }
      }
    });
  };

  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const cargarUsuarios = async () => {
    setIsLoading(true);
    try {
      const response = await crud.GET(`/api/usuarios`);

      //console.log("Respuesta GET /api/usuarios:", response);

      if (response?.usuarios) {
        setUsuarios(response.usuarios);
      } else {
        console.error("Respuesta inválida:", response);
        Swal.fire(
          "Error",
          "No se pudieron cargar los usuarios. Contacte al administrador.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      Swal.fire(
        "Error",
        "Ocurrió un error al cargar los usuarios. Intente nuevamente.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  return (
    <div className="bg-gray-300 min-h-screen flex">
      <SidebarAdmin isOpen={isOpen} toggleSidebar={toggleSidebar} />

      {/* CONTENIDO PRINCIPAL */}
      <main
        className={`flex-1 bg-green-300 p-4 sm:p-6 transition-all duration-300 ${
          isOpen ? "ml-48" : "ml-20"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          {/* Título + botón */}
          <div className="relative mb-6 flex flex-col items-center">
            <p className="text-lime-900 font-bold text-2xl sm:text-3xl tracking-tight italic text-center">
              Lista de Usuarios Registrados
            </p>

            <button
              onClick={handleCrearUsuario}
              className="
              mt-3 sm:mt-0
              w-full sm:w-auto
              flex items-center justify-center gap-2
              text-green-800 text-sm sm:text-base
              cursor-pointer bg-green-400 px-4 py-2 rounded-2xl hover:bg-green-600
              sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2
              "
            >
              <FaUserPlus className="text-lg sm:text-2xl" />
              <span className="font-semibold">Registro</span>
            </button>
          </div>

          {isLoading && (
            <p className="text-center text-sm text-gray-700 mb-4">
              Cargando usuarios...
            </p>
          )}

          {/* GRID DE TARJETAS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {usuarios.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-lg shadow-md flex flex-col"
              >
                <div className="bg-green-200 rounded-lg shadow-md flex flex-col h-full">
                  <div className="h-40 w-full overflow-hidden flex items-center justify-center">
                    <img
                      src={item.imagen || FotoUsuario}
                      alt={item.nombre}
                      className="w-full h-full object-contain object-center my-1 p-1"
                    />
                  </div>

                  <div className="p-3 sm:p-4 flex flex-col grow">
                    <h2 className="text-sm font-semibold mb-1.5 text-center text-zinc-900 wrap-break-word">
                      {item.nombre}
                    </h2>
                    <h2 className="text-xs mb-1.5 text-center text-zinc-900 wrap-break-word">
                      {item.cargo || "Sin cargo asignado"}
                    </h2>
                    <h2 className="text-xs mb-1.5 text-center text-zinc-900 wrap-break-word">
                      {item.email}
                    </h2>
                    <h2 className="text-xs mb-2 text-center text-zinc-900">
                      Rol: {item.rol}
                    </h2>

                    {/* BOTONES */}
                    <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 mt-auto">
                      {/* ACTUALIZAR */}
                      <button
                        onClick={() => handleActualizarUsuario(item._id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-lg w-full text-xs sm:text-sm"
                      >
                        Actualizar
                      </button>
                      

                      {/* ELIMINAR */}
                      <button
                        onClick={() => handleEliminarUsuario(item._id)}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-3 rounded-lg w-full text-xs sm:text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {!isLoading && usuarios.length === 0 && (
              <p className="col-span-full text-center text-sm text-gray-700">
                No hay usuarios registrados.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
