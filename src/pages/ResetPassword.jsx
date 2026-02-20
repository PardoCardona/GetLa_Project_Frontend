import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import crud from "../conexiones/crud";
import Swal from "sweetalert2";


const ResetPassword = () => {
  const { token } = useParams(); // 🔐 Captura el token de la URL
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 5) {
      return Swal.fire("Error", "Mínimo 5 caracteres", "error");
    }

    if (password !== confirmPassword) {
      return Swal.fire("Error", "Las contraseñas no coinciden", "error");
    }

    try {
      const response = await crud.POST(
        `/api/auth/reset-password/${token}`,
        { password }
      );

      Swal.fire("Éxito", response.msg, "success");

      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.msg || "Token inválido o expirado",
        "error"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-300">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-[90%] max-w-md"
      >
        <h2 className=" font-bold text-center mb-6 text-black text-xs">
          Restablecer contraseña
        </h2>

        <input
        
          type="password"
          placeholder="Nueva contraseña"
          className="w-full mt-1 p-1.5 border rounded-lg bg-gray-50 text-black text-xs"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirmar contraseña"
          className="w-full mt-1 p-1.5 border rounded-lg bg-gray-50 text-black text-xs"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600"
        >
          Cambiar contraseña
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
