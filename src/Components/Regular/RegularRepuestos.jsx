import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarAdmin from "../Sidebar/SidebarAdmin";
import Swal from "sweetalert2";
import crud from "../../conexiones/crud";

const RegularRepuestos = () => {
  const { categoriaId } = useParams();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [repuestos, setRepuestos] = useState([]);
  const [categoria, setCategoria] = useState(null);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  // 🔐 Auth
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, [navigate]);

  // 📦 Datos
  useEffect(() => {
    fetchCategoria();
    fetchRepuestos();
    // eslint-disable-next-line
  }, [categoriaId]);

  const fetchCategoria = async () => {
    try {
      const response = await crud.GET(`/api/repuestos/${categoriaId}`);

      console.log("Respuesta categoría:", response); // 🔍 DEBUG

      const categoriaData = response?.categoria || response;

      if (!categoriaData) {
        throw new Error("Categoría no encontrada");
      }

      setCategoria(categoriaData);
    } catch (error) {
      console.error("fetchCategoria:", error);

      Swal.fire({
        icon: "error",
        title: "Error al cargar",
        text: error?.message ?? "Error inesperado",
      });
    }
  };

  const fetchRepuestos = async () => {
    try {
      const data = await crud.GET(
        `/api/productos-repuestos/categoria/${categoriaId}`,
      );

      setRepuestos(data || []);
    } catch (error) {
      Swal.fire("Error", error.message || "Error al cargar repuestos", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex">
      <SidebarAdmin isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <main
        className={`flex-1 bg-green-300 p-4 transition-all ${
          isOpen ? "ml-48" : "ml-20"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          {/* HEADER */}
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-green-900 italic">
              Productos de Repuestos
            </h2>

            {categoria && (
              <p className="text-lg font-semibold text-green-800">
                Categoría: {categoria.nombre}
              </p>
            )}

            {/* 🟡 Indicador de rol */}
            <p className="mt-2 text-xs text-gray-700 italic">
              Modo Supervisor (solo lectura)
            </p>
          </div>

          {/* CONTENIDO */}
          {loading ? (
            <p className="text-center">Cargando...</p>
          ) : repuestos.length === 0 ? (
            <p className="text-center text-gray-700">
              No hay repuestos registrados.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {repuestos.map((rep) => (
                <div
                  key={rep._id}
                  className="bg-green-200 rounded-xl p-4 shadow flex flex-col text-sm"
                >
                  {/* IMAGEN */}
                  <img
                    src={rep.imagen}
                    alt={rep.nombre}
                    className="h-40 mx-auto rounded-xl object-contain"
                  />

                  <div className="mt-3 space-y-1 flex-1 text-gray-800">
                    {/* NOMBRE */}
                    <p className="font-bold text-center text-base">
                      {rep.nombre}
                    </p>

                    {/* REFERENCIA */}
                    <p className="text-xs text-center font-semibold">
                      Ref: {rep.referencia}
                    </p>

                    {/* DESCRIPCIÓN */}
                    <p className="text-xs">
                      <span className="font-semibold">Descripción:</span>{" "}
                      {rep.descripcion && rep.descripcion.trim() !== ""
                        ? rep.descripcion
                        : "Sin descripción"}
                    </p>

                    {/* STOCK */}
                    <p className="text-xs">
                      <span className="font-semibold">Stock:</span> {rep.stock}
                    </p>

                    {/* PRECIO */}
                    <p className="text-xs">
                      <span className="font-semibold">Precio:</span> $
                      {rep.precio.toLocaleString("es-CO")}
                    </p>

                    {/* ESTADO */}
                    <p className="text-xs flex items-center gap-1">
                      <span className="font-semibold">Estado:</span>
                      <span
                        className={`px-2 py-0.5 rounded text-white text-[10px]
                          ${
                            rep.estado === "OK"
                              ? "bg-green-600"
                              : rep.estado === "AGOTADO"
                                ? "bg-red-600"
                                : rep.estado === "DEFECTUOSO"
                                  ? "bg-gray-600"
                                  : rep.estado === "REPARACIÓN"
                                    ? "bg-blue-600"
                                    : "bg-yellow-600"
                          }`}
                      >
                        {rep.estado}
                      </span>
                    </p>
                  </div>

                  {/* 🟡 SIN BOTONES */}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RegularRepuestos;
