import useSWR from "swr";
import { getBuses } from "../services/mantencionService";

export const useBuses = () => {
  const { data, error, mutate } = useSWR("flota-buses", getBuses, {
    revalidateOnFocus: false,
  });

  return {
    buses: Array.isArray(data) ? data : data?.buses || [],
    loading: !data && !error,
    error,
    refresh: mutate,
  };
};
