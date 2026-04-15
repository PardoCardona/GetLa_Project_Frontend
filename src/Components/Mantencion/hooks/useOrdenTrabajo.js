import useSWR from "swr";
import { getOrden } from "../services/mantencionService";

export const useOrdenTrabajo = (mantenimientoId) => {
  const { data, error, mutate } = useSWR(
    mantenimientoId ? ["ordenTrabajo", mantenimientoId] : null,
    () => getOrden(mantenimientoId),
    {
      revalidateOnFocus: false,
    },
  );

  return {
    orden: data?.orden || data || null,
    loading: !data && !error,
    error,
    refresh: mutate,
  };
};
