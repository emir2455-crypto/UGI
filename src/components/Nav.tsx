import Link from "next/link";
import Image from "next/image";
import LogoutButton from "@/components/LogoutButton";
import type { SessionUser } from "@/lib/auth";

const LINKS = [
  { href: "/", label: "Tableau de bord", icon: "📊", adminOnly: false },
  { href: "/vehicles", label: "Véhicules", icon: "🚗", adminOnly: false },
  { href: "/reservations", label: "Réservations", icon: "📋", adminOnly: false },
  { href: "/calendar", label: "Calendrier", icon: "📅", adminOnly: false },
  { href: "/keyboxes", label: "Boîtiers à clés", icon: "🔑", adminOnly: false },
  { href: "/finances", label: "Finances", icon: "💶", adminOnly: true },
];

export default function Nav({ user }: { user: SessionUser }) {
  const links = LINKS.filter((l) => !l.adminOnly || user.role === "ADMIN");

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-60 md:shrink-0 border-r border-base-border bg-base-panel p-4">
        <div className="flex items-center gap-2 mb-6 px-1">
          <Image src="/logo.jpg" alt="UGI RENT" width={32} height={32} className="rounded-full" />
          <span className="font-bold text-lg tracking-tight text-amber">UGI RENT</span>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-300 hover:bg-base-panel2 hover:text-amber transition-colors"
            >
              <span className="text-lg">{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-base-border pt-3 mt-3">
          <p className="text-xs text-zinc-500 px-1 mb-2">
            {user.name} · {user.role === "ADMIN" ? "Administrateur" : "Renfort"}
          </p>
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-base-border bg-base-panel sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <Image src="/logo.jpg" alt="UGI RENT" width={28} height={28} className="rounded-full" />
          <span className="font-bold text-amber">UGI RENT</span>
        </div>
        <LogoutButton compact />
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-base-panel border-t border-base-border flex justify-around px-1 py-1 pb-[env(safe-area-inset-bottom)]">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex flex-col items-center justify-center gap-0.5 py-2 px-2 flex-1 rounded-lg text-zinc-400 active:bg-base-panel2 active:text-amber"
          >
            <span className="text-xl leading-none">{l.icon}</span>
            <span className="text-[10px] leading-none">{l.label.split(" ")[0]}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
