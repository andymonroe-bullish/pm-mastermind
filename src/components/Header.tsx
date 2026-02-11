"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/types";

export default function Header({ profile }: { profile: Profile }) {
  const supabase = createClient();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="bg-dark-navy text-white px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-bold tracking-wide">PM MASTERMIND</h1>
      <div className="flex items-center gap-4">
        {profile.role === "admin" && (
          <a
            href="/admin"
            className="text-sm bg-cyan text-white px-4 py-2 rounded-lg uppercase tracking-wider font-semibold hover:bg-cyan-hover transition-colors"
          >
            Admin Panel
          </a>
        )}
        <span className="text-sm text-gray-300">{profile.full_name || profile.email}</span>
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
