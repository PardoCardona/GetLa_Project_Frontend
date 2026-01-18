import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaArrowLeft,
  FaArrowRight,
  FaBroom,
  FaUserTie,
  FaFileInvoice,
  FaUsers,
} from "react-icons/fa";
import { MdBuild } from "react-icons/md";
import { IoSettingsSharp } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi";
import { MdReceiptLong } from "react-icons/md";
import Swal from "sweetalert2";
import logo from "../../assets/Logo_Getla.jpg";

const SidebarAdmin = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();

  // seguridad: si isOpen es undefined lo tratamos como true (sidebar visible por defecto)
  const open = typeof isOpen === "boolean" ? isOpen : true;
  const handleToggle = () => {
    if (typeof toggleSidebar === "function") toggleSidebar();
  };

  const handleLogout = () => {
    Swal.fire({
      title: "¿Cerrar sesión?",
      text: "Tu sesión se cerrará y volverás al inicio.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token"); // Limpia token
        Swal.fire({
          icon: "success",
          title: "Sesión cerrada",
          showConfirmButton: false,
          timer: 1200,
        });

        setTimeout(() => navigate("/"), 1200);
      }
    });
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-green-200 shadow-lg z-40 transition-all duration-300 
        ${open ? "w-48" : "w-20"}
      `}
    >
      {/* HEADER DEL SIDEBAR */}
      <div className="flex items-center justify-between p-4 border-b">
        {/* LOGO */}
        <img
          src={logo}
          className={`h-10 transition-opacity duration-300 rounded-lg ${
            open ? "opacity-100" : "opacity-0"
          }`}
          alt="Logo"
        />

        {/* BOTÓN COLAPSAR */}
        <button
          onClick={handleToggle}
          className="p-2 bg-green-400 rounded-lg hover:bg-green-600 transition"
          aria-label={open ? "Contraer sidebar" : "Expandir sidebar"}
        >
          {open ? <FaArrowLeft /> : <FaArrowRight />}
        </button>
      </div>

      {/* MENÚ PRINCIPAL */}
      <nav className="p-4">
        {/* USUARIOS -> navega a /admin */}
        <div
          onClick={() => navigate("/admin")}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-green-100 cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") navigate("/admin");
          }}
        >
          <FaUser className="text-xl text-green-800" />
          {open && <span className="text-gray-800">Usuario</span>}
        </div>

        {/* Cabecera */}
        <div
          onClick={() => navigate("/cabecera")}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-green-100 cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") navigate("/cabecera");
          }}
        >
          <FaFileInvoice className="text-xl text-green-800" />
          {open && <span className="text-gray-800">Cabecera</span>}
        </div>

        {/* Clientes */}
        <div
          onClick={() => navigate("/clientes")}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-green-100 cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") navigate("/clientes");
          }}
        >
          <FaUsers className="text-xl text-green-800" />
          {open && <span className="text-gray-800">Clientes</span>}
        </div>

        {/* Facturas */}
        <div
          onClick={() => navigate("/facturas")}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-green-100 cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") navigate("/facturas");
          }}
        >
          <MdReceiptLong className="text-xl text-green-800" />
          {open && <span className="text-gray-800">Facturas</span>}
        </div>

        {/* Repuestos */}
        <div
          onClick={() => navigate("/repuestos")}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-green-100 mt-2 cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") navigate("/repuestos");
          }}
        >
          <IoSettingsSharp className="text-2xl text-green-800" />
          {open && <span className="text-gray-800">Repuestos</span>}
        </div>

        {/* Dotacion */}
        <div
          onClick={() => navigate("/dotacion")}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-green-100 mt-2 cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") navigate("/dotacion");
          }}
        >
          <FaUserTie className="text-2xl text-green-800" />
          {open && <span className="text-gray-800">Dotación</span>}
        </div>

        {/* Limpieza */}
        <div
          onClick={() => navigate("/limpieza")}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-green-100 mt-2 cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") navigate("/limpieza");
          }}
        >
          <FaBroom className="text-2xl text-green-800" />
          {open && <span className="text-gray-800">Limpieza</span>}
        </div>

        {/* Mantencion */}
        <div
          onClick={() => navigate("/mantencion")}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-green-100 mt-2 cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") navigate("/mantencion");
          }}
        >
          <MdBuild className="text-2xl text-green-800" />
          {open && <span className="text-gray-800">Mantención</span>}
        </div>
      </nav>

      {/* LOGOUT - PEGADO ABAJO */}
      <div className="absolute bottom-5 w-full">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 w-full hover:bg-green-100 cursor-pointer transition-colors"
        >
          <FiLogOut className="text-2xl text-green-800 ml-2" />
          {open && <span className="text-gray-800 text-lg">Salir</span>}
        </button>
      </div>
    </aside>
  );
};

export default SidebarAdmin;
