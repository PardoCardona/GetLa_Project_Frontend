import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import crud from "../conexiones/crud";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  // watch("password") permite leer el valor actual para compararlo en confirmPassword
  const passwordActual = watch("password");

  const onSubmit = async (data) => {
    try {
      const response = await crud.POST(`/api/auth/reset-password/${token}`, {
        password: data.password,
      });
      Swal.fire("Éxito", response.msg, "success");
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.msg || "Token inválido o expirado",
        "error",
      );
    }
  };

  return (
    <div className="min-h-screen w-full bg-login bg-cover bg-center relative flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30"></div>
      <div
        className="
                    relative z-10
                    flex flex-col items-center gap-1
                    rounded-[30px] border-4 border-green-700
                    bg-green-100/10
                    p-6 sm:p-10
                    w-[90%] max-w-[440px]
                    shadow-2xl backdrop-blur-sm
                    animate-fadeIn
                  "
      >
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <div className="max-w-[180px] w-full">
            <img
              src="https://res.cloudinary.com/dv84nv8y0/image/upload/v1764612524/GetLa/Logo_GetLa_acxme3.jpg"
              alt="GET Latin American"
              className="w-full h-auto object-contain animate-popIn rounded-lg"
            />
          </div>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col items-center gap-5 w-full"
        >
          <h2 className="text-black text-center text-xl font-extrabold tracking-widest">
            RESTABLECER CONTRASEÑA
          </h2>

          {/* ── Input Nueva Contraseña ── */}
          <div className="relative w-full mb-5">
            <input
              type={mostrarPassword ? "text" : "password"}
              placeholder=" "
              {...register("password", {
                required: "La contraseña es obligatoria",
                minLength: { value: 5, message: "Mínimo 5 caracteres" },
              })}
              className="
              peer w-full rounded-full border border-black/20
              bg-green-200 px-12 py-3 text-sm font-bold text-black
              outline-none shadow-inner transition-all duration-300
              focus:bg-green-300
            "
            />

            {/* Label flotante */}
            <span
              className="
            pointer-events-none absolute left-12 -top-2
            text-[11px] font-bold text-black
            bg-green-100 px-2 rounded-md
            transition-all duration-300
            peer-placeholder-shown:top-3
            peer-placeholder-shown:text-[13px]
            peer-placeholder-shown:bg-transparent
            peer-placeholder-shown:px-0
            peer-placeholder-shown:rounded-none
          "
            >
              Ingrese Nueva Contraseña
            </span>

            {/* Icono izquierdo */}
            <span
              className="
            absolute left-3 top-3 flex items-center justify-center
            border-r border-green-700 pr-2 text-green-900 text-xl
          "
            >
              <FaLock />
            </span>

            {/* Botón mostrar/ocultar */}
            <button
              type="button"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              className="absolute right-3 top-3 text-green-900 text-xl"
            >
              {mostrarPassword ? <FaEyeSlash /> : <FaEye />}
            </button>

            {/* Error */}
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 pl-4">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* ── Input Confirmar Contraseña ── */}
          <div className="relative w-full mb-5">
            <input
              type={mostrarConfirmPassword ? "text" : "password"}
              placeholder=" "
              {...register("confirmPassword", {
                required: "Confirma tu contraseña",
                validate: (valor) =>
                  valor === passwordActual || "Las contraseñas no coinciden",
              })}
              className="
              peer w-full rounded-full border border-black/20
              bg-green-200 px-12 py-3 text-sm font-bold text-black
              outline-none shadow-inner transition-all duration-300
              focus:bg-green-300
            "
            />

            {/* Label flotante */}
            <span
              className="
            pointer-events-none absolute left-12 -top-2
            text-[11px] font-bold text-black
            bg-green-100 px-2 rounded-md
            transition-all duration-300
            peer-placeholder-shown:top-3
            peer-placeholder-shown:text-[13px]
            peer-placeholder-shown:bg-transparent
            peer-placeholder-shown:px-0
            peer-placeholder-shown:rounded-none
          "
            >
              Confirmar Nueva Contraseña
            </span>

            {/* Icono izquierdo */}
            <span
              className="
            absolute left-3 top-3 flex items-center justify-center
            border-r border-green-700 pr-2 text-green-900 text-xl
          "
            >
              <FaLock />
            </span>

            {/* Botón mostrar/ocultar */}
            <button
              type="button"
              onClick={() => setMostrarConfirmPassword(!mostrarConfirmPassword)}
              className="absolute right-3 top-3 text-green-900 text-xl"
            >
              {mostrarConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>

            {/* Error */}
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1 pl-4">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 text-white p-3 rounded-full hover:bg-green-600 font-bold transition-all duration-300"
          >
            Cambiar contraseña
          </button>
        </form>
      </div>
      {/* Estilos */}
      <style>
        {`
        .bg-login {
          background-image: url("https://res.cloudinary.com/dv84nv8y0/image/upload/v1772849503/GetLa/GetLa__Patios_eiepb0.jpg");
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
        `}
      </style>
    </div>
  );
};

export default ResetPassword;
