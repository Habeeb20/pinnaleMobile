// lib/dashboard-utils.ts
// Normalizes either a plain map {key: count} or an aggregate array [{_id, count}]
// into a consistent [label, value][] array.
export function toEntries(byRole: any): [string, number][] {
  if (!byRole) return [];
  if (Array.isArray(byRole)) {
    return byRole.map((r) => [r._id ?? "Unknown", r.count ?? 0]);
  }
  return Object.entries(byRole);
}