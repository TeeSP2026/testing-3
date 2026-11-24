export const card = "panel";
export const btnPrimary = "btn btn-green";
export const btnSecondary = "btn btn-ghost";
export const btnDanger = "btn btn-red";
export const input = "";
export const label = "lbl";

export function categoryColor(name: string | undefined | null): string {
  switch (name) {
    case "Platinum":
      return "#0F807B";
    case "Gold":
      return "#B97E0B";
    case "Silver":
      return "#6F86A0";
    default:
      return "#64798C";
  }
}

export function statusColor(status: string) {
  if (status === "Active") return "pill ok";
  if (status === "Pending") return "pill soon";
  return "pill line";
}
