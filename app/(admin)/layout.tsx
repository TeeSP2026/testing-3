import Image from "next/image";
import NavLink from "./NavLink";

const NAV_GROUPS = [
  {
    label: "概览 OVERVIEW",
    links: [
      { href: "/", label: "Dashboard", c: "#1D5C93" },
      { href: "/reports", label: "Reports", c: "#0F807B" },
    ],
  },
  {
    label: "会员 MEMBERS",
    links: [
      { href: "/members", label: "Members", c: "#0F807B" },
      { href: "/register-qr", label: "Register QR", c: "#DB6F12" },
      { href: "/categories", label: "Categories", c: "#1D5C93" },
    ],
  },
  {
    label: "积分 REWARDS",
    links: [{ href: "/rewards", label: "Rewards", c: "#B97E0B" }],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
                <NavLink key={link.href} href={link.href} label={link.label} c={link.c} />
              ))}
            </div>
          ))}
        </nav>
        <div className="side-foot">
          <div className="who">
            <b>Staff</b>
            <span className="muted small">v1 · demo</span>
          </div>
        </div>
      </aside>
      <div className="main">
        <div className="main-inner">{children}</div>
      </div>
    </div>
  );
}
