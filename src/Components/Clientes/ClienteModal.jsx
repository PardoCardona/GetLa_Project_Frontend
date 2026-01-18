import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import crud from "../../conexiones/crud";

const ClienteModal = ({
  clienteState,
  changeModalCliente,
  actualizarClientes,
}) => {
  const [cliente, setCliente] = useState({
    nombre: "",
    nit: "",
    direccion: "",
    ciudad: "",
    telefono: "",
  });

  /* ================================
     Sincronizar cliente seleccionado
  ================================ */
  useEffect(() => {
    if (clienteState) {
      setCliente({ ...clienteState }); // clonar objeto
    }
  }, [clienteState]);

  /* ================================
     Alertas
  ================================ */
  const alertSuccess = (title, text) =>
    Swal.fire({
      icon: "success",
      title,
      text,
      confirmButtonColor: "#2563eb",
    });

  const alertError = (title, text) =>
    Swal.fire({
      icon: "error",
      title,
      text,
      confirmButtonColor: "#dc2626",
    });

  const alertConfirm = ({
    title = "¿Estás seguro?",
    text = "Esta acción no se puede deshacer",
    confirmText = "Confirmar",
  }) =>
    Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });

  /* ================================
     Handlers
  ================================ */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCliente((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    if (!cliente?._id) {
      alertError("Error", "Cliente inválido para actualizar");
      return;
    }

    try {
      await crud.PUT(`/api/clientes/${cliente._id}`, cliente);
      await alertSuccess("Éxito", "Cliente actualizado correctamente");

      actualizarClientes();
      changeModalCliente();
    } catch (error) {
      console.error(error);
      alertError("Error", "No se pudo actualizar el cliente");
    }
  };

  const handleDelete = async () => {
    if (!cliente?._id) {
      alertError("Error", "Cliente inválido para eliminar");
      return;
    }

    const result = await alertConfirm({
      title: "¿Eliminar cliente?",
      text: "Esta acción no se puede deshacer",
      confirmText: "Eliminar",
    });

    if (!result.isConfirmed) return;

    try {
      await crud.DELETE(`/api/clientes/${cliente._id}`);
      await alertSuccess("Éxito", "Cliente eliminado correctamente");

      actualizarClientes();
      changeModalCliente();
    } catch (error) {
      console.error(error);
      alertError("Error", "No se pudo eliminar el cliente");
    }
  };

  /* ================================
     Render
  ================================ */
  if (!clienteState) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="rounded-t-xl bg-lime-500 px-6 py-4">
          <h2 className="text-center text-xl font-bold text-white">
            Editar Cliente
          </h2>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          {["nombre", "nit", "direccion", "ciudad", "telefono"].map((field) => (
            <div key={field}>
              <label className="mb-1 block text-sm font-semibold capitalize text-gray-700">
                {field}
              </label>
              <input
                type="text"
                name={field}
                value={cliente[field] || ""}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900
                           focus:border-blue-500 focus:outline-none
                           focus:ring-2 focus:ring-blue-200"
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 px-6 pb-6 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className="w-full rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 sm:w-auto"
          >
            Eliminar
          </button>

          <button
            type="button"
            onClick={changeModalCliente}
            className="w-full rounded-lg bg-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-400 sm:w-auto"
          >
            Cerrar
          </button>

          <button
            type="button"
            onClick={handleUpdate}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 sm:w-auto"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClienteModal;
