import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarAdmin from "../Sidebar/SidebarAdmin";
import Swal from "sweetalert2";

const ListaRepuestos = () => {
  const { categoriaId } = useParams();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [repuestos, setRepuestos] = useState([]);
  const [categoria, setCategoria] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🟢 Modal
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [repuestoEditId, setRepuestoEditId] = useState(null);

  // 📝 Formulario
  const [form, setForm] = useState({
    referencia: "",
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    imagen: "",
    estado: "OK",
  });

  const toggleSidebar = () => setIsOpen(!isOpen);

  // 🔐 Auth
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, [navigate]);

  // 📦 Datos
  useEffect(() => {
    fetchCategoria();
    fetchRepuestos();
    // eslint-disable-next-line
  }, [categoriaId]);

  const fetchCategoria = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:4000/api/repuestos/${categoriaId}`,
        { headers: { "x-auth-token": token } }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg);
      setCategoria(data.categoria);
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const fetchRepuestos = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:4000/api/productos-repuestos/categoria/${categoriaId}`,
        { headers: { "x-auth-token": token } }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg);
      setRepuestos(data || []);
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // 📝 Form
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      referencia: "",
      nombre: "",
      descripcion: "",
      precio: "",
      stock: "",
      imagen: "",
      estado: "OK",
    });
    setIsEdit(false);
    setRepuestoEditId(null);
  };

  // 🚀 Crear / Editar
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.referencia || !form.nombre || !form.imagen) {
      Swal.fire(
        "Campos obligatorios",
        "Referencia, nombre e imagen son obligatorios",
        "warning"
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const url = isEdit
        ? `http://localhost:4000/api/productos-repuestos/${repuestoEditId}`
        : "http://localhost:4000/api/productos-repuestos";

      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          referencia: form.referencia.trim(),
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim(),
          precio: Number(form.precio),
          stock: Number(form.stock),
          imagen: form.imagen.trim(),
          estado: form.estado,
          categoriaId,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.msg);

      Swal.fire(
        "Éxito",
        isEdit ? "Repuesto actualizado" : "Repuesto creado",
        "success"
      );

      setShowModal(false);
      resetForm();
      fetchRepuestos();
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  // ✏️ Editar
  const handleEditarRepuesto = (rep) => {
    setIsEdit(true);
    setRepuestoEditId(rep._id);
    setForm({
      referencia: rep.referencia,
      nombre: rep.nombre,
      descripcion: rep.descripcion || "",
      precio: rep.precio,
      stock: rep.stock,
      imagen: rep.imagen,
      estado: rep.estado,
    });
    setShowModal(true);
  };

  // 🗑️ Eliminar
  const handleEliminarRepuesto = async (id) => {
    const confirmacion = await Swal.fire({
      title: "¿Eliminar repuesto?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:4000/api/productos-repuestos/${id}`,
        { method: "DELETE", headers: { "x-auth-token": token } }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg);
      Swal.fire("Eliminado", "Repuesto eliminado", "success");
      fetchRepuestos();
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex">
      <SidebarAdmin isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <main
        className={`flex-1 bg-green-300 p-4 transition-all ${
          isOpen ? "ml-48" : "ml-20"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="relative mb-6 text-center">
            <h2 className="text-3xl font-bold text-green-900 italic">
              Productos de Repuestos
            </h2>

            {categoria && (
              <p className="text-lg font-semibold text-green-800">
                Categoría: {categoria.nombre}
              </p>
            )}

            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="mt-4 sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2
                         bg-green-500 hover:bg-green-600 text-green-900
                         px-4 py-2 rounded-2xl font-semibold"
            >
              + Nuevo Repuesto
            </button>
          </div>

          {loading ? (
            <p className="text-center">Cargando...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {repuestos.map((rep) => (
                <div
                  key={rep._id}
                  className="bg-green-200 rounded-xl p-4 shadow flex flex-col text-sm"
                >
                  {/* IMAGEN */}
                  <img
                    src={rep.imagen}
                    alt={rep.nombre}
                    className="h-40 mx-auto rounded-xl object-contain"
                  />

                  <div className="mt-3 space-y-1 flex-1 text-gray-800">
                    {/* NOMBRE */}
                    <p className="font-bold text-center text-base">
                      {rep.nombre}
                    </p>

                    {/* REFERENCIA */}
                    <p className="text-xs text-center font-semibold">
                      Ref: {rep.referencia}
                    </p>

                    {/* DESCRIPCIÓN */}
                    <p className="text-xs">
                      <span className="font-semibold">Descripción:</span>{" "}
                      {rep.descripcion && rep.descripcion.trim() !== ""
                        ? rep.descripcion
                        : "Sin descripción"}
                    </p>

                    {/* STOCK */}
                    <p className="text-xs">
                      <span className="font-semibold">Stock:</span> {rep.stock}
                    </p>

                    {/* PRECIO */}
                    <p className="text-xs">
                      <span className="font-semibold">Precio:</span> $
                      {rep.precio.toLocaleString("es-CO")}
                    </p>

                    {/* ESTADO */}
                    <p className="text-xs flex items-center gap-1">
                      <span className="font-semibold">Estado:</span>
                      <span
                        className={`px-2 py-0.5 rounded text-white text-[10px]
                                  ${
                                    rep.estado === "OK"
                                      ? "bg-green-600"
                                      : rep.estado === "AGOTADO"
                                      ? "bg-red-600"
                                      : rep.estado === "DEFECTUOSO"
                                      ? "bg-gray-600"
                                      : rep.estado === "REPARACIÓN"
                                      ? "bg-blue-600"
                                      : "bg-yellow-600"
                                  }`}
                      >
                        {rep.estado}
                      </span>
                    </p>
                  </div>

                  {/* BOTONES */}
                  <div className="flex gap-2 mt-3">
                    <button
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 rounded-lg"
                      onClick={() => handleEditarRepuesto(rep)}
                    >
                      ✏️ Editar
                    </button>

                    <button
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs py-1 rounded-lg"
                      onClick={() => handleEliminarRepuesto(rep._id)}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-green-200 p-6 rounded-xl shadow-lg w-96">
            <h3 className="text-center font-bold text-black mb-4">
              {isEdit ? "Editar Repuesto" : "Crear Repuesto"}
            </h3>

            <form onSubmit={handleSubmit}>
              {["referencia", "nombre", "imagen"].map((name) => (
                <input
                  key={name}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={name}
                  className="w-full mb-2 px-2 py-1 text-xs text-black border-2 rounded-lg"
                />
              ))}

              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Descripción"
                className="w-full mb-2 px-2 py-1 text-xs text-black border-2 rounded-lg"
              />

              <div className="grid grid-cols-2 gap-2 text-black">
                <input
                  type="number"
                  name="precio"
                  value={form.precio}
                  onChange={handleChange}
                  placeholder="Precio"
                  className="px-2 py-1 text-xs text-black border-2 rounded-lg"
                />
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="Stock"
                  className="px-2 py-1 text-xs text-black border-2 rounded-lg"
                />
              </div>

              <select
                name="estado"
                value={form.estado}
                onChange={handleChange}
                className="w-full mt-2 text-xs text-black border-2 rounded-lg"
              >
                <option value="OK">OK</option>
                <option value="DEFECTUOSO">DEFECTUOSO</option>
                <option value="REPARACIÓN">REPARACIÓN</option>
                <option value="AGOTADO">AGOTADO</option>
                <option value="PENDIENTE">PENDIENTE</option>
              </select>

              <div className="flex justify-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 text-xs rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-700 text-white px-3 py-1 text-xs rounded"
                >
                  {isEdit ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaRepuestos;
