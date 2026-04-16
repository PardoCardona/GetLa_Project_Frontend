import useSWR from "swr";
import { getBuses } from "../services/mantencionService";

export const useBuses = () => {
  const { data, error, mutate } = useSWR("flota-buses", getBuses, {
    revalidateOnFocus: false,
  });

  // Fuerza re-fetch inmediato limpiando el caché primero
  const refresh = () => mutate(undefined, { revalidate: true });

  return {
    buses: Array.isArray(data) ? data : data?.buses || [],
    loading: !data && !error,
    error,
    refresh,
  };
};
