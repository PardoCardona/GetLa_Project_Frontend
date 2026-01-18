import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import SidebarAdmin from "../Sidebar/SidebarAdmin";
import { useNavigate } from "react-router-dom";

// ---------- VALIDACIÓN ----------
const schema = yup.object().shape({
  nombre: yup.string().required("El nombre de la categoría es obligatorio"),
  imagen: yup
    .string()
    .url("Debe ser una URL válida")
    .required("La imagen es obligatoria"),
});

const CategoriaRepuesto = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen((v) => !v);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  // ===========================================================
  // 📌 CREAR NUEVA CATEGORÍA
  // ===========================================================
  const onSubmit = async (formData) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:4000/api/repuestos",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        Swal.fire(
          "Error",
          result.msg || "No se pudo crear la categoría",
          "error"
        );
        return;
      }

      // 🔥 SweetAlert + redirección a AdminRepuestos.jsx
      Swal.fire("Éxito", "Categoría creada correctamente ✔", "success").then(
        () => {
          navigate("/repuestos");
        }
      );

      reset();
    } catch (error) {
      Swal.fire("Error", "No se pudo conectar con el servidor", "error");
    }
  };

  // ===========================================================
  // 📌 VISTA FINAL
  // ===========================================================
  return (
    <div className="bg-green-300 min-h-screen flex">
      <SidebarAdmin isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <main
        className={`flex-1 flex flex-col justify-center items-center px-3 transition-all duration-300 ${
          isOpen ? "ml-48" : "ml-20"
        }`}
      >
        {/* TÍTULO */}
        <p className="text-lime-900 font-bold text-2xl sm:text-3xl text-center mt-6 mb-4">
          Registrar Categoría de Repuestos
        </p>

        {/* CUADRO CENTRADO */}
        <div className="flex flex-col justify-center items-center w-full">
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
                  placeholder="Ej: Motores, Frenos, Accesorios..."
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
                  placeholder="https://ejemplo.com/imagen.png"
                  className="w-full mt-1 p-2 border rounded-lg bg-gray-50 text-black text-sm"
                />
                {errors.imagen && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.imagen.message}
                  </p>
                )}
              </div>

              {/* Botón */}
              <input
                type="submit"
                value="Crear Categoría"
                className="bg-green-300 w-full py-2 text-black uppercase font-bold rounded-lg hover:bg-green-400 transition-colors text-sm cursor-pointer"
              />
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CategoriaRepuesto;
