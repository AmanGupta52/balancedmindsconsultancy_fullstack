import { useCallback, useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/client";

/** GET a resource with loading/error state and a manual reload. */
export default function useFetch(url, { enabled = true, params } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const paramsKey = JSON.stringify(params || {});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(url, { params: JSON.parse(paramsKey) });
      setData(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [url, paramsKey]);

  useEffect(() => {
    if (enabled) load();
  }, [enabled, load]);

  return { data, setData, loading, error, reload: load };
}
