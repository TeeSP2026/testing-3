"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconDashboard,
  IconUsers,
  IconQrCode,
  IconMedal,
  IconFileText,
  IconGift,
  IconStar,
  IconChartPie,
} from "./NavIcons";

const ICONS = {
  dashboard: IconDashboard,
  users: IconUsers,
  qrcode: IconQrCode,
  medal: IconMedal,
  filetext: IconFileText,
  gift: IconGift,
  star: IconStar,
  chartpie: IconChartPie,
} as const;

export type NavIconKey = keyof typeof ICONS;

export default function NavLink({
  href,
  label,
  c,
  icon,
}: {
  href: string;
  label: string;
  c: string;
  icon: NavIconKey;
}) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  const Icon = ICONS[icon];
  return (
    <Link href={href} className={active ? "on" : ""}>
      <span className="nv-l">
        <span className="nv-chip" style={{ ["--c" as string]: c }}>
          <Icon />
        </span>
        <span>{label}</span>
      </span>
    </Link>
  );
}
