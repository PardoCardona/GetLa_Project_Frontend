import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import Swal from "sweetalert2";
import crud from "../../conexiones/crud";

const CabeceraModal = ({
  isOpen,
  onClose,
  cabeceraSeleccionada,
  actualizarCabeceras,
}) => {
  const [form, setForm] = useState({
    local: "",
    nit: "",
    direccion: "",
    telefono: "",
    email: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const getAuthToken = () => localStorage.getItem("token");

  /* ================================
     Sincronizar cabecera
  ================================ */
  useEffect(() => {
    if (cabeceraSeleccionada) {
      setForm({
        local: cabeceraSeleccionada.local || "",
        nit: cabeceraSeleccionada.nit || "",
        direccion: cabeceraSeleccionada.direccion || "",
        telefono: cabeceraSeleccionada.telefono || "",
        email: cabeceraSeleccionada.email || "",
      });
    }
  }, [cabeceraSeleccionada]);

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

  const alertConfirm = ({ title, text, confirmText = "Confirmar" }) =>
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
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const validarCampos = () => {
    const { local, nit, direccion, telefono, email } = form;
    return local && nit && direccion && telefono && email;
  };

  const handleUpdate = async () => {
    if (!validarCampos()) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const token = getAuthToken();

      await crud.PUT(`/api/cabecera/${cabeceraSeleccionada._id}`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await alertSuccess(
        "Actualizado",
        "La cabecera fue actualizada correctamente"
      );

      actualizarCabeceras();
      onClose();
    } catch (err) {
      console.error(err);
      alertError("Error", "No se pudo actualizar la cabecera.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const result = await alertConfirm({
      title: "¿Eliminar cabecera?",
      text: "Esta acción no se puede deshacer",
      confirmText: "Eliminar",
    });

    if (!result.isConfirmed) return;

    setIsDeleting(true);
    setError("");

    try {
      const token = getAuthToken();

      await crud.DELETE(`/api/cabecera/${cabeceraSeleccionada._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await alertSuccess(
        "Eliminada",
        "La cabecera fue eliminada correctamente"
      );

      actualizarCabeceras();
      onClose();
    } catch (err) {
      console.error(err);
      alertError("Error", "No se pudo eliminar la cabecera.");
    } finally {
      setIsDeleting(false);
    }
  };

  /* ================================
     Render
  ================================ */
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-green-100 rounded-lg p-6 max-w-md w-full mx-auto outline-none"
      overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
    >
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
        Editar Cabecera
      </h2>

      <div className="space-y-3">
        {["local", "nit", "direccion", "telefono", "email"].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 capitalize">
              {field}
            </label>
            <input
              type={field === "email" ? "email" : "text"}
              name={field}
              value={form[field]}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-gray-900 focus:ring-2 focus:ring-lime-500"
            />
          </div>
        ))}
      </div>

      {error && (
        <p className="text-red-600 text-sm mt-3 text-center">{error}</p>
      )}

      <div className="flex flex-col sm:flex-row justify-between gap-2 mt-6">
        <button
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          onClick={handleDelete}
          disabled={isDeleting || isSaving}
        >
          {isDeleting ? "Eliminando..." : "Eliminar"}
        </button>

        <div className="flex gap-2">
          <button
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            onClick={onClose}
            disabled={isSaving || isDeleting}
          >
            Cancelar
          </button>

          <button
            className={`px-4 py-2 rounded-lg text-white ${
              isSaving
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            onClick={handleUpdate}
            disabled={isSaving || isDeleting}
          >
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CabeceraModal;
