import React, { useState } from "react";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import crud from "../../conexiones/crud";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";

// ================= VALIDACIÓN =================
const schema = yup.object().shape({
  email: yup
    .string()
    .email("Correo electrónico no válido")
    .required("El correo es obligatorio"),
  password: yup
    .string()
    .min(5, "La contraseña debe tener al menos 5 caracteres")
    .required("La contraseña es obligatoria"),
});

const Login = () => {
  const navigate = useNavigate();
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const ingresarCuenta = async (data) => {
    try {
      const response = await crud.POST("/api/auth", data);

      console.log("RESPONSE LOGIN:", response);


      if (response.msg) {
        Swal.fire("Error", response.msg, "error");
        return;
      }

      const token = response.token;
      const decoded = jwtDecode(token);
      const usuario = decoded.usuario;

      // 🔐 Guardar sesión
      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(usuario));

      // 🔁 Redirección por rol
      switch (usuario.rol) {
        case "admin":
          navigate("/admin");
          break;
        case "adminrep":
          navigate("/repuestos");
          break;
        case "admindot":
          navigate("/dotacion");
          break;
        case "adminlimp":
          navigate("/limpieza");
          break;
        case "adminmant":
          navigate("/mantencion");
          break;
        case "regular":
          navigate("/repuestos");
          break;
        default:
          Swal.fire(
            "Error",
            "Rol no reconocido. Contacte al administrador.",
            "error",
          );
          localStorage.clear();
      }
    } catch (error) {
      Swal.fire("Error", "Hubo un problema en la autenticación.", "error");
    }
  };

  // ================= JSX =================
  return (
    <div className="min-h-screen w-full bg-login bg-cover bg-center relative flex items-center justify-center">
      {/* Overlay transparente */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Tarjeta principal */}
      <div
        className="
          relative z-10 
          flex flex-col items-center gap-1
          rounded-[30px] border-4 border-green-700
          bg-green-100/10
          p-8 sm:p-10 
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

        {/* FORM */}
        <form
          onSubmit={handleSubmit(ingresarCuenta)}
          className="flex flex-col items-center gap-5 w-full"
        >
          <h2 className="text-black text-center text-xl font-extrabold tracking-widest">
            Ingresa aquí
          </h2>

          {/* EMAIL */}
          <div className="relative w-full">
            <input
              type="text"
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
              Ingrese su Usuario
            </span>

            {/* Icono */}
            <span
              className="
                absolute left-3 top-3 flex items-center justify-center
                border-r border-green-700 pr-2 text-green-900 text-xl
              "
            >
              <FaUser />
            </span>

            <p className="text-red-600 text-xs mt-1">{errors.email?.message}</p>
          </div>

          {/* PASSWORD */}
          <div className="relative w-full">
            <input
              type={mostrarPassword ? "text" : "password"}
              placeholder=" "
              {...register("password")}
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
              Ingrese su Contraseña
            </span>

            {/* Icono Password */}
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
              className="absolute right-4 top-3 text-green-900 text-lg"
            >
              {mostrarPassword ? <FaEyeSlash /> : <FaEye />}
            </button>

            <p className="text-red-600 text-xs mt-1">
              {errors.password?.message}
            </p>
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
            Ingresar
          </button>
        </form>
      </div>

      {/* Estilos */}
      <style>
        {`
        .bg-login {
          background-image: url("https://res.cloudinary.com/dv84nv8y0/image/upload/v1764612525/GetLa/ImagenLogin_k2fkrr.jpg");
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }

        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-popIn {
          animation: popIn 0.6s ease-out;
        }
        `}
      </style>
    </div>
  );
};

export default Login;
