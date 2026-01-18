import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarAdmin from "../Sidebar/SidebarAdmin";
import Swal from "sweetalert2";

const ListaDotacion = () => {
  const { categoriaId } = useParams();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [productos, setProductos] = useState([]);
  const [categoria, setCategoria] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [productoEditId, setProductoEditId] = useState(null);

  // Formulario
  const [form, setForm] = useState({
    referencia: "",
    nombre: "",
    talla: "",
    descripcion: "",
    precio: "",
    stock: "",
    imagen: "",
    estado: "OK",
  });

  const toggleSidebar = () => setIsOpen(!isOpen);

  // 🔐 Verificar autenticación
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, [navigate]);

  // 📦 Cargar productos
  useEffect(() => {
    fetchCategoria();
    fetchProductos();
    // eslint-disable-next-line
  }, [categoriaId]);

  const fetchProductos = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:4000/api/productos-dotacion/porcategoria/${categoriaId}`,
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || "Error al cargar productos");
      }

      setProductos(data.productos || data || []);
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoria = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:4000/api/dotacion/${categoriaId}`,
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Error al cargar la categoría");
      }

      setCategoria(data);
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  // 📝 Manejo de formulario
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      referencia: "",
      nombre: "",
      talla: "",
      descripcion: "",
      precio: "",
      stock: "",
      imagen: "",
      estado: "OK",
    });
    setIsEdit(false);
    setProductoEditId(null);
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
        ? `http://localhost:4000/api/productos-dotacion/${productoEditId}`
        : "http://localhost:4000/api/productos-dotacion";

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
          talla: form.talla.trim(),
          descripcion: form.descripcion.trim(),
          precio: Number(form.precio),
          stock: Number(form.stock),
          imagen: form.imagen.trim(),
          estado: form.estado,
          categoriaId,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || "Error al guardar");
      }

      Swal.fire(
        "Éxito",
        isEdit ? "Producto actualizado" : "Producto creado",
        "success"
      );

      setShowModal(false);
      resetForm();
      fetchProductos();
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  // ✏️ Editar
  const handleEditar = (prod) => {
    setIsEdit(true);
    setProductoEditId(prod._id);
    setForm({
      referencia: prod.referencia,
      nombre: prod.nombre,
      talla: prod.talla,
      descripcion: prod.descripcion || "",
      precio: prod.precio,
      stock: prod.stock,
      imagen: prod.imagen,
      estado: prod.estado,
    });
    setShowModal(true);
  };

  // 🗑️ Eliminar
  const handleEliminar = async (id) => {
    const confirmacion = await Swal.fire({
      title: "¿Eliminar producto?",
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
        `http://localhost:4000/api/productos-dotacion/${id}`,
        {
          method: "DELETE",
          headers: {
            "x-auth-token": token,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || "Error al eliminar");
      }

      Swal.fire("Eliminado", "Producto eliminado", "success");
      fetchProductos();
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
              Productos de Dotación
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
              + Nuevo Producto
            </button>
          </div>

          {loading ? (
            <p className="text-center">Cargando...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {productos.map((prod) => (
                <div
                  key={prod._id}
                  className="bg-green-200 rounded-xl p-4 shadow flex flex-col text-sm"
                >
                  {/* IMAGEN */}
                  <img
                    src={prod.imagen}
                    alt={prod.nombre}
                    className="h-40 mx-auto rounded-xl object-contain"
                  />

                  <div className="mt-3 space-y-1 flex-1 text-gray-800">
                    {/* NOMBRE */}
                    <p className="font-bold text-center text-base">
                      {prod.nombre}
                    </p>
                    {/* REFERENCIA */}
                    <p className="text-xs text-center font-semibold">
                      Ref: {prod.referencia}
                    </p>
                    {/* TALLA */}
                    <p className="text-xs">
                      <strong>Talla:</strong> {prod.talla}
                    </p>
                    {/* DESCRIPCIÓN */}
                    <p className="text-xs">
                      <strong>Descripción:</strong>{" "}
                      {prod.descripcion || "Sin descripción"}
                    </p>
                    {/* STOCK */}
                    <p className="text-xs">
                      <strong>Stock:</strong> {prod.stock}
                    </p>
                    {/* PRECIO */}
                    <p className="text-xs">
                      <strong>Precio:</strong> $
                      {prod.precio.toLocaleString("es-CO")}
                    </p>
                    {/* ESTADO */}
                    <p className="text-xs flex items-center gap-2">
                      <strong>Estado:</strong>
                      <span
                        className={`px-2 py-0.5 rounded-full text-white text-[10px] font-semibold
                                  ${
                                    prod.estado === "OK"
                                      ? "bg-green-600"
                                      : prod.estado === "AGOTADO"
                                      ? "bg-red-600"
                                      : prod.estado === "DEFECTUOSO"
                                      ? "bg-orange-500"
                                      : "bg-yellow-500"
                                  }
                                `}
                      >
                        {prod.estado}
                      </span>
                    </p>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 rounded-lg"
                      onClick={() => handleEditar(prod)}
                    >
                      ✏️ Editar
                    </button>

                    <button
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs py-1 rounded-lg"
                      onClick={() => handleEliminar(prod._id)}
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

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-green-200 p-6 rounded-xl shadow-lg w-96">
            <h3 className="text-center font-bold mb-4 text-black">
              {isEdit ? "Editar Producto" : "Crear Producto"}
            </h3>

            <form onSubmit={handleSubmit}>
              {["referencia", "nombre", "talla", "imagen"].map((name) => (
                <input
                  key={name}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={name}
                  className="w-full mb-2 px-2 py-1 text-xs text-black border rounded-lg"
                />
              ))}

              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Descripción"
                className="w-full mb-2 px-2 py-1 text-xs text-black border rounded-lg"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  name="precio"
                  value={form.precio}
                  onChange={handleChange}
                  placeholder="Precio"
                  className="px-2 py-1 text-xs text-black border rounded-lg"
                />
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="Stock"
                  className="px-2 py-1 text-xs text-black border rounded-lg"
                />
              </div>

              <select
                name="estado"
                value={form.estado}
                onChange={handleChange}
                className="w-full mt-2 text-xs text-black border rounded-lg"
              >
                <option value="OK">OK</option>
                <option value="DEFECTUOSO">DEFECTUOSO</option>
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
                  className="bg-red-500 text-white px-3 py-1 text-xs rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-3 py-1 text-xs rounded"
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

export default ListaDotacion;
