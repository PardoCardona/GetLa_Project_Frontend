import crud from "../../../conexiones/crud";

// ==============================
// 🚍 F L O T A  (BUSES)
// ==============================
export const getBuses = async () => {
  return await crud.GET("/api/flota");
};

export const getBusById = async (id) => {
  return await crud.GET(`/api/flota/${id}`);
};

export const createBus = async (data) => {
  return await crud.POST("/api/flota", data);
};

export const updateBus = async (id, data) => {
  return await crud.PUT(`/api/flota/${id}`, data);
};

export const deleteBus = async (id) => {
  return await crud.DELETE(`/api/flota/${id}`);
};

// ==============================
// 🛠️ M A N T E N C I Ó N  B U S
// ==============================
export const getMantenimientos = async (busId) => {
  if (!busId) return [];
  return await crud.GET(`/api/mantencionBus?busId=${busId}`);
};

export const getMantenimientoById = async (id) => {
  return await crud.GET(`/api/mantencionBus/${id}`);
};

export const createMantenimiento = async (data) => {
  return await crud.POST("/api/mantencionBus", data);
};

export const updateMantenimiento = async (id, data) => {
  return await crud.PUT(`/api/mantencionBus/${id}`, data);
};

export const deleteMantenimiento = async (id) => {
  return await crud.DELETE(`/api/mantencionBus/${id}`);
};
// ==============================
// 📄 ORDEN DE TRABAJO
// ==============================

export const getOrden = async (mantenimientoId) => {
  try {
    if (!mantenimientoId) return null;

    const data = await crud.GET(
      `/api/ordenTrabajo/mantenimiento/${mantenimientoId}`,
    );

    console.log("🔍 RAW respuesta getOrden:", JSON.stringify(data)); // ← AGREGA ESTO

    return data?.msg ? null : data;
  } catch (error) {
    console.warn("Orden no encontrada:", error);
    return null;
  }
};

export const createOrden = async (data) => {
  return await crud.POST("/api/ordenTrabajo", data);
};

export const updateOrden = async (id, data) => {
  return await crud.PUT(`/api/ordenTrabajo/${id}`, data);
};

export const deleteOrden = async (id) => {
  return await crud.DELETE(`/api/ordenTrabajo/${id}`);
};
