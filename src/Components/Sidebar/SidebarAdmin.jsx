import React, { useEffect, useState } from "react";
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
import { MdBuild, MdReceiptLong } from "react-icons/md";
import { IoSettingsSharp } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi";
import Swal from "sweetalert2";
import logo from "../../assets/Logo_Getla.jpg";
import crud from "../../conexiones/crud";

const SidebarAdmin = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const open = typeof isOpen === "boolean" ? isOpen : true;

  // =======================
  // ESTADOS
  // =======================
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  // =======================
  // CARGA + VALIDACIÓN DE USUARIO
  // =======================
  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        // 1️⃣ Cargar rápido desde localStorage
        const storedUser = localStorage.getItem("usuario");
        if (storedUser) {
          setUsuario(JSON.parse(storedUser));
        }

        // 2️⃣ Validar contra backend
        const response = await crud.GET("/api/auth");

        // 3️⃣ Guardar usuario real
        setUsuario(response.usuario);
        localStorage.setItem("usuario", JSON.stringify(response.usuario));
      } catch (error) {
        console.error("Sesión inválida", error);
        localStorage.clear();
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    cargarUsuario();
  }, [navigate]);

  // =======================
  // LOADING
  // =======================
  if (loading) {
    return (
      <aside className="fixed top-0 left-0 h-full w-20 bg-green-200 flex items-center justify-center">
        <span className="text-sm text-green-900">Cargando...</span>
      </aside>
    );
  }

  const rol = usuario?.rol?.toLowerCase();

  // =======================
  // PERMISOS POR ROL
  // =======================
  const permisosPorRol = {
    admin: [
      "usuario",
      "cabecera",
      "clientes",
      "facturas",
      "repuestos",
      "insumos",
      "limpieza",
      "mantencion",
    ],
    adminrep: ["repuestos"],
    admindot: ["insumos"],
    adminlimp: ["limpieza"],
    adminmant: ["mantencion"],
    regular: [],
  };

  const permisos = permisosPorRol[rol] || [];

  const puedeAcceder = (modulo) => {
    if (rol === "admin") return true;
    return permisos.includes(modulo);
  };

  // =======================
  // HANDLERS
  // =======================
  const handleToggle = () => {
    if (typeof toggleSidebar === "function") toggleSidebar();
  };

  const handleLogout = () => {
    Swal.fire({
      title: "¿Cerrar sesión?",
      text: "Tu sesión se cerrará y volverás al inicio.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        navigate("/");
      }
    });
  };

  // =======================
  // RENDER
  // =======================
  return (
    <aside
      className={`text-gray-900 fixed top-0 left-0 h-full bg-green-200 shadow-lg z-40 transition-all duration-300 ${
        open ? "w-48" : "w-20"
      }`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b">
        <img
          src={logo}
          className={`h-10 rounded-lg transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
          alt="Logo"
        />

        <button
          onClick={handleToggle}
          className="p-2 bg-green-400 rounded-lg hover:bg-green-600 transition"
        >
          {open ? <FaArrowLeft /> : <FaArrowRight />}
        </button>
      </div>

      {/* USUARIO */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <FaUser className="text-2xl text-green-800" />
          {open && (
            <div>
              <p className="text-sm font-bold">{usuario?.nombre}</p>
              <p className="text-xs capitalize">{usuario?.rol}</p>
            </div>
          )}
        </div>
      </div>

      {/* MENÚ */}
      <nav className="p-4 space-y-1">
        {[
          {
            key: "usuario",
            icon: <FaUser />,
            label: "Usuarios",
            path: "/admin",
          },
          {
            key: "cabecera",
            icon: <FaFileInvoice />,
            label: "Cabecera",
            path: "/cabecera",
          },
          {
            key: "clientes",
            icon: <FaUsers />,
            label: "Clientes",
            path: "/clientes",
          },
          {
            key: "facturas",
            icon: <MdReceiptLong />,
            label: "Facturas",
            path: "/facturas",
          },
          {
            key: "repuestos",
            icon: <IoSettingsSharp />,
            label: "Repuestos",
            path: "/repuestos",
          },
          {
            key: "insumos",
            icon: <FaUserTie />,
            label: "Dotación",
            path: "/dotacion",
          },
          {
            key: "limpieza",
            icon: <FaBroom />,
            label: "Insumos",
            path: "/limpieza",
          },
          {
            key: "mantencion",
            icon: <MdBuild />,
            label: "Mantención",
            path: "/mantencion",
          },
        ].map(({ key, icon, label, path }) => (
          <div
            key={key}
            onClick={() => puedeAcceder(key) && navigate(path)}
            className={`flex items-center gap-3 p-2 rounded-lg ${
              puedeAcceder(key)
                ? "hover:bg-green-100 cursor-pointer"
                : "opacity-40 cursor-not-allowed"
            }`}
          >
            <span className="text-xl text-green-800">{icon}</span>
            {open && <span>{label}</span>}
          </div>
        ))}
      </nav>

      {/* LOGOUT */}
      <div className="absolute bottom-5 w-full">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 w-full hover:bg-green-100"
        >
          <FiLogOut className="text-2xl text-green-800 ml-2" />
          {open && <span className="text-lg">Salir</span>}
        </button>
      </div>
    </aside>
  );
};

export default SidebarAdmin;
