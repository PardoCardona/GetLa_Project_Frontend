import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import SidebarAdmin from "../Sidebar/SidebarAdmin";
import { useNavigate } from "react-router-dom";
import crud from "../../conexiones/crud";

// ---------- VALIDACIÓN ----------
const schema = yup.object().shape({
  nombre: yup.string().required("El nombre de la categoría es obligatorio"),
  imagen: yup
    .string()
    .url("Debe ser una URL válida")
    .required("La imagen es obligatoria"),
});

const CategoriaDotacion = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen((v) => !v);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

 // ===========================================================
// 📌 CREAR NUEVA CATEGORÍA
// ===========================================================
const onSubmit = async (formData) => {
  try {
    const response = await crud.POST("/api/dotacion", formData);

    if (response?.msg && response.msg.toLowerCase().includes("error")) {
      Swal.fire(
        "Error",
        response.msg || "No se pudo crear la categoría",
        "error"
      );
      return;
    }

    Swal.fire(
      "Éxito",
      "Categoría de dotación creada correctamente ✔",
      "success"
    ).then(() => {
      navigate("/dotacion");
    });

    reset();

  } catch (error) {
    Swal.fire("Error", "No se pudo conectar con el servidor", "error");
  }
};

  // ===========================================================
  // 📌 VISTA
  // ===========================================================
  return (
    <div className="bg-green-300 min-h-screen flex">
      <SidebarAdmin isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <main
        className={`flex-1 flex flex-col justify-center items-center px-3 transition-all duration-300 ${
          isOpen ? "ml-48" : "ml-20"
        }`}
      >
        <p className="text-lime-900 font-bold text-2xl sm:text-3xl text-center mt-6 mb-4">
          Registrar Categoría de Dotación
        </p>

        <div className="w-full max-w-md bg-green-200 px-6 py-5 rounded-xl shadow-lg border border-green-300">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="uppercase text-gray-600 block text-xs font-bold">
                Nombre de la Categoría
              </label>
              <input
                type="text"
                {...register("nombre")}
                className="w-full mt-1 p-2 border rounded-lg bg-gray-50 text-black text-sm"
              />
              {errors.nombre && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.nombre.message}
                </p>
              )}
            </div>

            {/* Imagen */}
            <div>
              <label className="uppercase text-gray-600 block text-xs font-bold">
                Imagen (URL)
              </label>
              <input
                type="text"
                {...register("imagen")}
                className="w-full mt-1 p-2 border rounded-lg bg-gray-50 text-black text-sm"
              />
              {errors.imagen && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.imagen.message}
                </p>
              )}
            </div>

            <input
              type="submit"
              value="Crear Categoría"
              className="bg-green-300 w-full py-2 text-black uppercase font-bold rounded-lg hover:bg-green-400 transition-colors text-sm cursor-pointer"
            />
          </form>
        </div>
      </main>
    </div>
  );
};

export default CategoriaDotacion;
