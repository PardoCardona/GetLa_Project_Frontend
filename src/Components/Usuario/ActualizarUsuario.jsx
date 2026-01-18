import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import SidebarAdmin from "../Sidebar/SidebarAdmin";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // ⬅ ICONOS AGREGADOS

// ---------- VALIDACIÓN ----------
const schema = yup.object().shape({
  nombre: yup.string().required("El nombre es obligatorio"),
  cargo: yup.string().required("El cargo es obligatorio"),
  email: yup
    .string()
    .email("Correo inválido")
    .required("El email es obligatorio"),
  rol: yup.string().required("El rol es obligatorio"),
  password: yup.string(), // opcional
});

const ActualizarUsuario = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen((v) => !v);

  // 👁‍🗨 CONTROLAR VISIBILIDAD DEL PASSWORD
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // ===========================================================
  // 📌 CARGAR USUARIO
  // ===========================================================
  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/");

        const response = await fetch(
          `http://localhost:4000/api/usuarios/${id}`,
          {
            headers: { "x-auth-token": token },
          }
        );

        if (!response.ok) {
          Swal.fire("Error", "No se pudo cargar el usuario", "error");
          return;
        }

        const data = await response.json();

        setValue("imagen", data.imagen);
        setValue("nombre", data.nombre);
        setValue("cargo", data.cargo);
        setValue("email", data.email);
        setValue("rol", data.rol);
      } catch (err) {
        Swal.fire("Error", "Hubo un problema al cargar el usuario", "error");
      } finally {
        setLoading(false);
      }
    };

    cargarUsuario();
  }, [id, navigate, setValue]);

  // ===========================================================
  // 📌 ACTUALIZAR USUARIO
  // ===========================================================
  const onSubmit = async (formData) => {
    try {
      const token = localStorage.getItem("token");

      // Si password viene vacía → no actualizar
      if (!formData.password) delete formData.password;

      const response = await fetch(`http://localhost:4000/api/usuarios/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        Swal.fire("Error", result.msg || "No se pudo actualizar", "error");
        return;
      }

      Swal.fire("Éxito", "Usuario actualizado correctamente", "success");
      navigate("/admin");
    } catch (error) {
      Swal.fire("Error", "Error al actualizar el usuario", "error");
    }
  };

  // ===========================================================
  // 📌 LOADING
  // ===========================================================
  if (loading) {
    return (
      <div className="flex justify-center mt-20 text-lg font-semibold">
        Cargando usuario...
      </div>
    );
  }

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
        <p className="text-lime-900 font-bold text-xl sm:text-2xl text-center mb-3 italic">
          Actualizar Usuario
        </p>

        <div className="w-full max-w-sm bg-green-200 px-4 py-3 rounded-xl shadow-md border border-green-300">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            {/* Imagen */}
            <div>
              <label className="uppercase text-gray-600 block text-[10px] font-bold">
                Imagen del Usuario
              </label>
              <input
                type="text"
                {...register("imagen")}
                placeholder="URL de Cloudinary"
                className="w-full mt-1 p-1.5 border rounded-lg bg-gray-50 text-black text-xs"
              />
            </div>

            {/* Nombre */}
            <div>
              <label className="uppercase text-gray-600 block text-[10px] font-bold">
                Nombre
              </label>
              <input
                type="text"
                {...register("nombre")}
                placeholder="Nombre del Usuario"
                className="w-full mt-1 p-1.5 border rounded-lg bg-gray-50 text-black text-xs"
              />
              {errors.nombre && (
                <p className="text-red-500 text-[10px]">
                  {errors.nombre.message}
                </p>
              )}
            </div>

            {/* Cargo */}
            <div>
              <label className="uppercase text-gray-600 block text-[10px] font-bold">
                Cargo
              </label>
              <input
                type="text"
                {...register("cargo")}
                placeholder="Cargo del Usuario"
                className="w-full mt-1 p-1.5 border rounded-lg bg-gray-50 text-black text-xs"
              />
              {errors.cargo && (
                <p className="text-red-500 text-[10px]">
                  {errors.cargo.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="uppercase text-gray-600 block text-[10px] font-bold">
                Email
              </label>
              <input
                type="email"
                {...register("email")}
                placeholder="Correo electrónico"
                className="w-full mt-1 p-1.5 border rounded-lg bg-gray-50 text-black text-xs"
              />
              {errors.email && (
                <p className="text-red-500 text-[10px]">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Rol */}
            <div>
              <label className="uppercase text-gray-600 block text-[10px] font-bold">
                Rol
              </label>
              <select
                {...register("rol")}
                className="w-full mt-1 p-1.5 border rounded-lg bg-gray-50 text-black text-xs"
              >
                <option value="">Seleccione...</option>
                <option value="admin">Administrador</option>
                <option value="adminrep">Jefe Bodega de Repuestos</option>
                <option value="admindot">Jefe Bodega de Dotación</option>
                <option value="adminlimp">Jefe Bodega de Limpieza</option>
                <option value="adminmant">Jefe de Mantención</option>
                <option value="regular">Supervisor</option>
              </select>
            </div>

            {/* Password con iconos */}
            <div className="relative">
              <label className="uppercase text-gray-600 block text-[10px] font-bold">
                Nueva Contraseña (opcional)
              </label>

              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Dejar vacío para no cambiar"
                className="w-full mt-1 p-1.5 pr-10 border rounded-lg bg-gray-50 text-black text-xs"
              />

              {/* BOTÓN MOSTRAR/OCULTAR */}
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[30px] cursor-pointer text-gray-600"
              >
                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </span>
            </div>

            {/* BOTÓN */}
            <input
              type="submit"
              value="Actualizar Usuario"
              className="bg-green-300 w-full py-1.5 text-black uppercase font-bold rounded-lg hover:bg-green-400 transition-colors text-xs cursor-pointer mt-1"
            />
          </form>
        </div>
      </main>
    </div>
  );
};

export default ActualizarUsuario;
