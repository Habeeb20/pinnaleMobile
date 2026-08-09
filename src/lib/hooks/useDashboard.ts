// lib/hooks/useDashboard.ts
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

export function useDashboard(role: string) {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const endpoint =
    role === "superadmin"
      ? `${BASE}/dashboard/superadmin`
      : `${BASE}/dashboard/admin`;

  const fetchDashboard = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to load dashboard");
      }
      setData(json.data);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [endpoint, token]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { data, loading, error, refetch: fetchDashboard };
}