// lib/hooks/useRoleDashboard.ts
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

const ROLE_ENDPOINTS: Record<string, string> = {
  superadmin: "/dashboard/superadmin",
  admin: "/dashboard/admin",
  teacher: "/teacher/dashboard",
  student: "/student/dashboard",
};

export function useRoleDashboard(role: string) {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const endpoint = ROLE_ENDPOINTS[role];

  const fetchDashboard = useCallback(async () => {
    if (!token || !endpoint) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${BASE}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to load dashboard");
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