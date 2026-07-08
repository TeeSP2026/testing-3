import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Loyalty Membership System",
  description: "Track members, points, transactions, redemptions, and categories",
};

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/members", label: "Members" },
  { href: "/rewards", label: "Rewards" },
  { href: "/categories", label: "Categories" },
  { href: "/reports", label: "Reports" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-neutral-50 text-neutral-900 min-h-screen">
        <header className="border-b border-neutral-200 bg-white sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-8">
            <span className="font-semibold tracking-tight">Loyalty Membership</span>
            <nav className="flex gap-1 text-sm">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
