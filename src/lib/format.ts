// lib/format.ts
export function fmtMoney(n?: number | null) {
  if (n === null || n === undefined) return "—";
  return `₦${Number(n).toLocaleString()}`;
}
export function fmtDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
export function fmtShortDate(d?: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}
export function fmtMonth(m?: string | null) {
  if (!m) return "";
  const [y, mo] = m.split("-");
  return new Date(Number(y), Number(mo) - 1).toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
}
export function initials(name?: string) {
  return name?.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "U";
}
export function toEntries(byX: any): [string, number][] {
  if (!byX) return [];
  if (Array.isArray(byX)) return byX.map((r) => [r._id ?? "Unknown", r.count ?? 0]);
  return Object.entries(byX);
}