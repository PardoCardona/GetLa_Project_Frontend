import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// --------------------
// Login
// --------------------
import LoginForm from "./Components/Login/LoginForm";

// --------------------
// Admin
// --------------------
import Admin from "./Components/Admin/Admin";

// --------------------
// Usuario
// --------------------
import CrearUsuario from "./Components/Usuario/CrearUsuario";
import ActualizarUsuario from "./Components/Usuario/ActualizarUsuario";

// --------------------
// Paneles por área
// --------------------
import Cabecera from "./Components/Cabeceras/Cabecera";
import Clientes from "./Components/Clientes/Clientes";
import Factura from "./Components/Facturas/Factura";
import Mantencion from "./Components/Mantencion/AdminMantencion";
import Repuestos from "./Components/Repuestos/AdminRepuestos";
import Dotacion from "./Components/Dotacion/AdminDotacion";
import Limpieza from "./Components/Limpieza/AdminLimpieza";

// --------------------
// Repuestos
// --------------------
import CategoriaRepuesto from "./Components/Repuestos/CategoriaRepuesto";
import ListaRepuestos from "./Components/Repuestos/ListaRepuestos";

// --------------------
// Dotación
// --------------------
import CategoriaDotacion from "./Components/Dotacion/CategoriaDotacion";
import ListaDotacion from "./Components/Dotacion/ListaDotacion";

// --------------------
// Limpieza
// --------------------
import CategoriaLimpieza from "./Components/Limpieza/CategoriaLimpieza";
import ListaLimpieza from "./Components/Limpieza/ListaLimpieza";

// --------------------
// Recuperacion_contraseña
// --------------------
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  return (
    <Router>
      <Routes>
        {/* ==================== LOGIN ==================== */}
        <Route path="/" element={<LoginForm />} />

        {/* ==================== PANEL ADMIN ==================== */}
        <Route path="/admin" element={<Admin />} />

        {/* ==================== USUARIOS ==================== */}
        <Route path="/admin/crear-usuario" element={<CrearUsuario />} />
        <Route
          path="/admin/actualizar-usuario/:id"
          element={<ActualizarUsuario />}
        />

        {/* ==================== Cabecera ==================== */}
        <Route path="/cabecera" element={<Cabecera />} />

        {/* ==================== Clientes ==================== */}
        <Route path="/clientes" element={<Clientes />} />

        {/* ==================== Facturas ==================== */}
        <Route path="/facturas" element={<Factura />} />

        {/* ==================== REPUESTOS ==================== */}
        <Route
          path="/AdminRepuestos/categorias"
          element={<CategoriaRepuesto />}
        />
        <Route
          path="/AdminRepuestos/lista/:categoriaId"
          element={<ListaRepuestos />}
        />

        {/* ==================== DOTACIÓN ==================== */}
        <Route
          path="/AdminDotacion/categorias"
          element={<CategoriaDotacion />}
        />
        <Route
          path="/AdminDotacion/lista/:categoriaId"
          element={<ListaDotacion />}
        />

        {/* ==================== LIMPIEZA ==================== */}
        <Route
          path="/AdminLimpieza/categorias"
          element={<CategoriaLimpieza />}
        />
        <Route
          path="/AdminLimpieza/lista/:categoriaId"
          element={<ListaLimpieza />}
        />

        {/* ==================== PANELES POR ÁREA ==================== */}
        <Route path="/mantencion" element={<Mantencion />} />
        <Route path="/repuestos" element={<Repuestos />} />
        <Route path="/dotacion" element={<Dotacion />} />
        <Route path="/limpieza" element={<Limpieza />} />

        {/* ==================== PANELES POR ÁREA ==================== */}
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </Router>
  );
}

export default App;
