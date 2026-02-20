import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import crud from "../conexiones/crud";
import Swal from "sweetalert2";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      return Swal.fire("Error", "Ingrese su correo", "error");
    }

    try {
      const response = await crud.POST("/api/auth/forgot-password", { email });

      Swal.fire("Correo enviado", response.msg, "success");

      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.msg || "Error al enviar correo",
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
        <h2 className="text-lg font-bold text-center mb-6 text-black">
          Recuperar contraseña
        </h2>

        <input
          type="email"
          placeholder="Ingrese su correo"
          className="w-full mb-6 p-3 border rounded text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600"
        >
          Enviar enlace
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;