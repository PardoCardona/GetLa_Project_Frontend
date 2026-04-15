import useSWR from "swr";
import { getMantenimientos } from "../services/mantencionService";

export const useMantenimientos = (busId) => {
  const { data, error, mutate } = useSWR(
    busId ? ["mantencionBus", busId] : null,
    () => getMantenimientos(busId),
    {
      revalidateOnFocus: false,
    },
  );

  return {
    mantenimientos: Array.isArray(data) ? data : data?.mantenimientos || [],
    loading: !data && !error,
    error,
    refresh: mutate,
  };
};
