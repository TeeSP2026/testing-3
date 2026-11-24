import Image from "next/image";
import NavLink, { NavIconKey } from "./NavLink";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "../login/actions";

const NAV_GROUPS: { label: string; links: { href: string; label: string; c: string; icon: NavIconKey }[] }[] = [
  {
    label: "概览 OVERVIEW",
    links: [
      { href: "/", label: "Dashboard", c: "#60A5FA", icon: "dashboard" },
      { href: "/reports", label: "Reports", c: "#22D3EE", icon: "chartpie" },
    ],
  },
  {
    label: "会员 MEMBERS",
    links: [
      { href: "/members", label: "Members", c: "#2DD4BF", icon: "users" },
      { href: "/register-qr", label: "Register QR", c: "#FBBF24", icon: "qrcode" },
      { href: "/categories", label: "Categories", c: "#C084FC", icon: "medal" },
    ],
  },
  {
    label: "交易 TRANSACTIONS",
    links: [
      { href: "/sales", label: "Sales", c: "#FB923C", icon: "filetext" },
      { href: "/redemptions", label: "Redemptions", c: "#F472B6", icon: "gift" },
    ],
  },
  {
    label: "积分 REWARDS",
    links: [{ href: "/rewards", label: "Rewards", c: "#4ADE80", icon: "star" }],
  },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="app">
      <aside className="side">
        <div className="brand">
          <div className="brand-mark">
            <Image src="/logo.jpg" alt="MA Plantation" width={64} height={50} className="brand-logo" />
          </div>
          <div className="brand-name">
            MA PLANTATION
            <small>永發肥料企業</small>
          </div>
        </div>
        <nav className="nav">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="nav-group">{group.label}</div>
              {group.links.map((link) => (
                <NavLink key={link.href} href={link.href} label={link.label} c={link.c} icon={link.icon} />
              ))}
            </div>
          ))}
        </nav>
        <div className="side-foot">
          <div className="who-row">
            <div className="who">
              <b>{user?.fullName ?? user?.email ?? "Staff"}</b>
              <span className="muted small">{user?.role === "admin" ? "Admin" : "Staff"}</span>
            </div>
            <form action={signOut} className="logout">
              <button type="submit" className="btn btn-ghost btn-sm">
                登出
              </button>
            </form>
          </div>
        </div>
      </aside>
      <div className="main">
        <div className="main-inner">{children}</div>
      </div>
    </div>
  );
}
