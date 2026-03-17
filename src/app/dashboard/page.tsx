import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import EventCountdown from "@/components/EventCountdown";
import DashboardTabs from "@/components/DashboardTabs";
import type { Profile, EventInfo, ChecklistItem, ChecklistProgress, EventFile } from "@/lib/types";


export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  // Fetch all data in parallel
  const [profileRes, eventRes, checklistRes, progressRes, filesRes] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("event_info").select("*").limit(1).single(),
      supabase.from("checklist_items").select("*").order("sort_order"),
      supabase.from("checklist_progress").select("*").eq("user_id", user.id),
      supabase.from("event_files").select("*").order("uploaded_at", { ascending: false }),
    ]);

  const profile = (profileRes.data as Profile | null) ?? {
    id: user.id,
    email: user.email || "",
    full_name: "",
    role: "attendee" as const,
    created_at: new Date().toISOString(),
  };
  const event = eventRes.data as EventInfo | null;
  const checklistItems = (checklistRes.data || []) as ChecklistItem[];
  const checklistProgress = (progressRes.data || []) as ChecklistProgress[];
  const files = (filesRes.data || []) as EventFile[];

  return (
    <div className="min-h-screen bg-light-card">
      <Header profile={profile} />

      <main className="max-w-5xl mx-auto px-4 py-4 sm:py-8">
        {/* Welcome */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-3xl font-bold text-dark-text">
            Welcome{profile.full_name ? `, ${profile.full_name}` : ""}!
          </h1>
          <p className="text-gray-500 mt-1">
            Here&apos;s everything you need for {event?.title || "the event"}.
          </p>
        </div>

        <EventCountdown />

        <DashboardTabs
          event={event}
          checklistItems={checklistItems}
          checklistProgress={checklistProgress}
          files={files}
          userId={user.id}
        />
      </main>


    </div>
  );
}
