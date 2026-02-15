import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert2";
import crud from "../../conexiones/crud";
import SidebarAdmin from "../Sidebar/SidebarAdmin";
import { FaEye, FaEyeSlash } from "react-icons/fa";

// ---------- YUP VALIDATION ----------
const schema = yup.object().shape({
  nombre: yup.string().required("El nombre es obligatorio"),
  email: yup
    .string()
    .email("Correo electrónico no válido")
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|org|edu|gov|mil|co|es|info|biz|cl)$/,
      "Dominio no permitido"
    )
    .required("El correo es obligatorio"),
  rol: yup
    .string()
    .oneOf(["admin", "regular"], "El rol debe ser 'admin' o 'regular'")
    .required("El rol es obligatorio"),
  password: yup
    .string()
    .min(5, "La contraseña debe tener al menos 5 caracteres")
    .required("La contraseña es obligatoria"),
  confirmar: yup
    .string()
    .oneOf([yup.ref("password"), null], "Las contraseñas deben coincidir")
    .required("Debe confirmar la contraseña"),
});

const CrearUsuario = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const autenticarUsuario = () => {
      const token = localStorage.getItem("token");
      if (!token) navigate("/");
    };
    autenticarUsuario();
  }, [navigate]);

  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen((v) => !v);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [preview, setPreview] = useState("");

  const crearUsuario = async (data) => {
    const { imagen, nombre, cargo, email, rol, password } = data;

    const nuevoUsuario = { imagen, nombre, cargo, email, rol, password };
    const response = await crud.POST(`/api/usuarios`, nuevoUsuario);

    if (response.msg === "El usuario ya existe") {
      swal.fire("Error", "El usuario ya existe", "error");
    } else {
      swal.fire("Éxito", "Usuario creado correctamente", "success");
      navigate("/admin");
    }
  };

  return (
    <div className="bg-green-300 min-h-screen flex">
      <SidebarAdmin isOpen={isOpen} toggleSidebar={toggleSidebar} />

      {/* ¡Centrado total! */}
      <main
        className={`flex-1 flex flex-col justify-center items-center px-3 transition-all duration-300 ${
          isOpen ? "ml-48" : "ml-20"
        }`}
      >
        <p className="text-lime-900 font-bold text-xl sm:text-2xl text-center mb-3 italic">
          Registrar Usuario
        </p>

        <div className="w-full max-w-sm bg-green-200 px-4 py-3 rounded-xl shadow-md border border-green-300">
          <form onSubmit={handleSubmit(crearUsuario)} className="space-y-2">
            
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
                onChange={(e) => setPreview(e.target.value)}
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

            {/* Password */}
            <div>
              <label className="uppercase text-gray-600 block text-[10px] font-bold">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  {...register("password")}
                  placeholder="Ingrese Contraseña"
                  className="w-full mt-1 p-1.5 border rounded-lg bg-gray-50 text-black text-xs"
                />
                <span
                  className="absolute right-2 top-2 cursor-pointer text-gray-600 text-sm"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            {/* Confirmar */}
            <div>
              <label className="uppercase text-gray-600 block text-[10px] font-bold">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  {...register("confirmar")}
                  placeholder="Confirme Contraseña"
                  className="w-full mt-1 p-1.5 border rounded-lg bg-gray-50 text-black text-xs"
                />
                <span
                  className="absolute right-2 top-2 cursor-pointer text-gray-600 text-sm"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            {/* Botón */}
            <input
              type="submit"
              value="Registrar Usuario"
              className="bg-green-300 w-full py-1.5 text-black uppercase font-bold rounded-lg hover:bg-green-400 transition-colors text-xs cursor-pointer mt-1"
            />
          </form>
        </div>
      </main>
    </div>
  );
};

export default CrearUsuario;
