import React, { useState } from "react";
import Modal from "react-modal";
import Swal from "sweetalert2";
import crud from "../../conexiones/crud";

const CrearCabeceraModal = ({ onClose, actualizarCabeceras }) => {
  /* ===============================
     CONFIGURACIÓN DE CAMPOS
  =============================== */
  const campos = [
    {
      name: "local",
      label: "Local",
      type: "text",
      placeholder: "Ej: Sede Centro",
      required: true,
    },
    {
      name: "nit",
      label: "NIT",
      type: "text",
      placeholder: "Ej: 900123456-7",
      required: true,
    },
    {
      name: "direccion",
      label: "Dirección",
      type: "text",
      placeholder: "Ej: Calle 10 # 5-30",
      required: true,
    },
    {
      name: "telefono",
      label: "Teléfono",
      type: "text",
      placeholder: "Ej: 3001234567",
      required: true,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Ej: contacto@empresa.com",
      required: true,
    },
  ];

  /* ===============================
     ESTADOS
  =============================== */
  const [form, setForm] = useState({
    local: "",
    nit: "",
    direccion: "",
    telefono: "",
    email: "",
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const getAuthToken = () => localStorage.getItem("token");

  /* ===============================
     UTILIDADES
  =============================== */
  const sanitizeInput = (name, value) => {
    if (name === "telefono") {
      return value.replace(/\D/g, ""); // Solo números
    }
    if (name === "nit") {
      return value.replace(/[^0-9-]/g, "");
    }
    return value.trimStart();
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!form.local.trim()) {
      nuevosErrores.local = "El nombre del local es obligatorio.";
    }

    if (!form.nit.trim()) {
      nuevosErrores.nit = "El NIT es obligatorio.";
    } else if (!/^[0-9-]+$/.test(form.nit)) {
      nuevosErrores.nit = "Formato de NIT inválido.";
    }

    if (!form.direccion.trim()) {
      nuevosErrores.direccion = "La dirección es obligatoria.";
    }

    if (!form.telefono.trim()) {
      nuevosErrores.telefono = "El teléfono es obligatorio.";
    } else if (form.telefono.length < 7) {
      nuevosErrores.telefono = "Teléfono inválido.";
    }

    if (!form.email.trim()) {
      nuevosErrores.email = "El email es obligatorio.";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)) {
      nuevosErrores.email = "Formato de email inválido.";
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  /* ===============================
     HANDLERS
  =============================== */
  const handleChange = (e) => {
    const { name, value } = e.target;

    const sanitized = sanitizeInput(name, value);

    setForm((prev) => ({
      ...prev,
      [name]: sanitized,
    }));

    // Limpiar error cuando el usuario escribe
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) return;

    setIsSaving(true);

    try {
      const token = getAuthToken();

      await crud.POST(
        "/api/cabecera",
        { ...form },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await Swal.fire({
        icon: "success",
        title: "Cabecera creada",
        text: "La cabecera fue creada correctamente.",
        confirmButtonColor: "#16a34a",
      });

      actualizarCabeceras();
      onClose();
    } catch (err) {
      const mensaje =
        err.response?.data?.msg || "No se pudo crear la cabecera.";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: mensaje,
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setIsSaving(false);
    }
  };

  /* ===============================
     RENDER
  =============================== */
  return (
    <Modal
      isOpen
      onRequestClose={onClose}
      className="bg-green-100 rounded-xl p-6 max-w-md w-full mx-auto outline-none shadow-xl"
      overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
    >
      <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
        Crear Cabecera
      </h2>

      <div className="space-y-4">
        {campos.map((campo) => (
          <div key={campo.name}>
            <label
              htmlFor={campo.name}
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              {campo.label}
            </label>

            <input
              id={campo.name}
              type={campo.type}
              name={campo.name}
              value={form[campo.name]}
              onChange={handleChange}
              placeholder={campo.placeholder}
              aria-invalid={!!errors[campo.name]}
              aria-describedby={`${campo.name}-error`}
              className={`w-full p-2 border rounded-md text-gray-800
                placeholder-gray-400
                focus:ring-2 focus:ring-lime-500
                ${
                  errors[campo.name]
                    ? "border-red-500 focus:ring-red-400"
                    : "border-gray-300"
                }`}
              disabled={isSaving}
            />

            {errors[campo.name] && (
              <p
                id={`${campo.name}-error`}
                className="text-red-600 text-xs mt-1"
              >
                {errors[campo.name]}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-2 mt-8">
        <button
          type="button"
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
          onClick={onClose}
          disabled={isSaving}
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className={`px-4 py-2 rounded-lg text-white transition ${
            isSaving
              ? "bg-green-300 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isSaving ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </Modal>
  );
};

export default CrearCabeceraModal;
