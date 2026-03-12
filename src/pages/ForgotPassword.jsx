import React from "react";
import { MdEmail } from "react-icons/md";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import crud from "../conexiones/crud";
import Swal from "sweetalert2";

// ================= VALIDACIÓN =================
const schema = yup.object().shape({
  email: yup
    .string()
    .email("Correo electrónico no válido")
    .required("El correo es obligatorio"),
});

const ForgotPassword = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const enviarEnlace = async (data) => {
    try {
      const response = await crud.POST("/api/auth/forgot-password", data);

      if (response.msg) {
        Swal.fire("Error", response.msg, "error");
        return;
      }

      Swal.fire(
        "Éxito",
        "Enlace de recuperación enviado a tu correo.",
        "success",
      );
      navigate("/");
    } catch (error) {
      Swal.fire("Error", "Hubo un problema al enviar el enlace.", "error");
    }
  };

  // ================= JSX =================
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
                    w-[90%] max-w-[420px]
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
          onSubmit={handleSubmit(enviarEnlace)}
          className="flex flex-col items-center gap-5 w-full"
        >
          <h2 className="text-black text-center text-xl font-extrabold tracking-widest">
            RECUPERAR CONTRASEÑA
          </h2>

          {/* EMAIL */}
          <div className="relative w-full">
            <input
              type="email"
              autoComplete="off"
              placeholder=" "
              {...register("email")}
              className="
                peer w-full rounded-full border border-black/20
                bg-green-200 px-12 py-3 text-sm font-bold text-black
                outline-none shadow-inner
                transition-all duration-300
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
              Ingrese su correo
            </span>

            {/* Ícono */}
            <span
              className="
                absolute left-3 top-3 flex items-center justify-center
                border-r border-green-700 pr-2 text-green-900 text-xl
              "
            >
              <MdEmail />
            </span>

            <p className="text-red-600 text-xs mt-1">{errors.email?.message}</p>
          </div>

          {/* BOTÓN */}
          <button
            type="submit"
            className="
              w-full rounded-full bg-green-500
              py-3 text-sm font-bold text-black
              shadow-md
              hover:bg-green-600 hover:scale-[1.03]
              active:scale-95
              transition-all duration-300
            "
          >
            Enviar enlace
          </button>

          <p
            onClick={() => navigate("/")}
            className="text-xs font-bold text-black cursor-pointer mt-2 hover:underline"
          >
            ¿Ya recordaste tu contraseña? Inicia sesión
          </p>
        </form>
      </div>

      {/* Estilos */}
      <style>
        {`
        .bg-login {
          background-image: url("https://res.cloudinary.com/dv84nv8y0/image/upload/v1772849369/GetLa/GetLa_Desierto_ccsczi.jpg");
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

export default ForgotPassword;
