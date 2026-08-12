// src/lib/hooks/useMyClass.ts
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

export function useMyClass() {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClass = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${BASE}/classes/my-class`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to load class");
      setData(json.data);
    } catch (err: any) {
      setError(err.message || "Failed to load class");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchClass();
  }, [fetchClass]);

  return { data, loading, error, refetch: fetchClass };
}