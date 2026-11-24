import Image from "next/image";
import NavLink, { NavIconKey } from "./NavLink";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "../login/actions";
import { getT } from "@/lib/i18n/server";
import LanguageSwitcher from "@/lib/i18n/LanguageSwitcher";

const NAV_GROUPS: { groupKey: string; links: { href: string; key: string; c: string; icon: NavIconKey }[] }[] = [
  {
    groupKey: "nav.overview",
    links: [
      { href: "/", key: "nav.dashboard", c: "#60A5FA", icon: "dashboard" },
      { href: "/reports", key: "nav.reports", c: "#22D3EE", icon: "chartpie" },
    ],
  },
  {
    groupKey: "nav.membersGroup",
    links: [
      { href: "/members", key: "nav.members", c: "#2DD4BF", icon: "users" },
      { href: "/register-qr", key: "nav.registerQr", c: "#FBBF24", icon: "qrcode" },
      { href: "/categories", key: "nav.categories", c: "#C084FC", icon: "medal" },
    ],
  },
  {
    groupKey: "nav.transactionsGroup",
    links: [
      { href: "/sales", key: "nav.sales", c: "#FB923C", icon: "filetext" },
      { href: "/redemptions", key: "nav.redemptions", c: "#F472B6", icon: "gift" },
    ],
  },
  {
    groupKey: "nav.rewardsGroup",
    links: [{ href: "/rewards", key: "nav.rewards", c: "#4ADE80", icon: "star" }],
  },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const t = await getT();

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
            <div key={group.groupKey}>
              <div className="nav-group">{t(group.groupKey)}</div>
              {group.links.map((link) => (
                <NavLink key={link.href} href={link.href} label={t(link.key)} c={link.c} icon={link.icon} />
              ))}
            </div>
          ))}
        </nav>
        <div className="side-foot">
          <LanguageSwitcher />
          <div className="who-row">
            <div className="who">
              <b>{user?.fullName ?? user?.email ?? t("common.staff")}</b>
              <span className="muted small">{user?.role === "admin" ? t("common.admin") : t("common.staff")}</span>
            </div>
            <form action={signOut} className="logout">
              <button type="submit" className="btn btn-ghost btn-sm">
                {t("common.logout")}
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
