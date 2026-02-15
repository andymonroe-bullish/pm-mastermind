"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/types";

export default function Header({ profile }: { profile: Profile }) {
  const supabase = createClient();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Best-effort logout — redirect regardless
    }
    router.push("/");
    router.refresh();
  };

  return (
    <header className="bg-dark-navy text-white px-3 py-3 sm:px-6 sm:py-4 flex items-center justify-between gap-2">
      <h1 className="text-base sm:text-xl font-bold tracking-wide flex-shrink-0">PM MASTERMIND</h1>
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {profile.role === "admin" && (
          <a
            href="/admin"
            className="text-xs sm:text-sm bg-cyan text-white px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg uppercase tracking-wider font-semibold hover:bg-cyan-hover transition-colors flex-shrink-0"
          >
            <span className="hidden sm:inline">Admin Panel</span>
            <span className="sm:hidden">Admin</span>
          </a>
        )}
        <span className="text-xs sm:text-sm text-gray-300 truncate hidden sm:block">{profile.full_name || profile.email}</span>
        <button
          onClick={handleSignOut}
          className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors flex-shrink-0"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
