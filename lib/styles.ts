export const card = "bg-white rounded-xl border border-neutral-200 shadow-sm";
export const btnPrimary =
  "inline-flex items-center justify-center rounded-lg bg-neutral-900 text-white text-sm font-medium px-4 py-2 hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
export const btnSecondary =
  "inline-flex items-center justify-center rounded-lg bg-white border border-neutral-300 text-neutral-700 text-sm font-medium px-4 py-2 hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
export const btnDanger =
  "inline-flex items-center justify-center rounded-lg bg-red-600 text-white text-sm font-medium px-4 py-2 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
export const input =
  "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400";
export const label = "block text-sm font-medium text-neutral-700 mb-1";

export function categoryColor(name: string | undefined | null) {
  switch (name) {
    case "Platinum":
      return "bg-slate-800 text-white";
    case "Gold":
      return "bg-amber-100 text-amber-800";
    case "Silver":
      return "bg-neutral-200 text-neutral-700";
    default:
      return "bg-neutral-100 text-neutral-600";
  }
}

export function statusColor(status: string) {
  return status === "Active"
    ? "bg-green-100 text-green-700"
    : "bg-neutral-200 text-neutral-600";
}
