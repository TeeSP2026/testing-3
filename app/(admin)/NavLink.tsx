"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({ href, label, c }: { href: string; label: string; c: string }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link href={href} className={active ? "on" : ""}>
      <span className="nv-l">
        <span className="nv-chip" style={{ ["--c" as string]: c }}>
          ●
        </span>
        <span>{label}</span>
      </span>
    </Link>
  );
}
