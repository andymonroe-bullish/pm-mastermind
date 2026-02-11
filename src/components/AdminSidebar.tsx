"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Event Info", icon: "📋" },
  { href: "/admin/checklist", label: "Checklist", icon: "✅" },
  { href: "/admin/itinerary", label: "Itinerary", icon: "🗓️" },
  { href: "/admin/files", label: "Files", icon: "📁" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-dark-navy min-h-screen p-6 flex flex-col">
      <div className="mb-8">
        <h2 className="text-white font-bold text-lg tracking-wider uppercase">Admin Panel</h2>
        <Link
          href="/dashboard"
          className="text-xs text-gray-400 hover:text-cyan transition-colors mt-1 inline-block"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-cyan/20 text-cyan"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{item.icon}</span>
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Link
        href="/dashboard"
        className="mt-auto flex items-center gap-2 px-4 py-3 rounded-lg bg-cyan/10 text-cyan hover:bg-cyan/20 transition-colors text-sm font-medium"
      >
        👁️ View as Attendee
      </Link>
    </aside>
  );
}
