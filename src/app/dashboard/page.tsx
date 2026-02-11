import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import EventInfoCard from "@/components/EventInfoCard";
import DashboardChecklist from "@/components/DashboardChecklist";
import ItineraryTimeline from "@/components/ItineraryTimeline";
import EventFiles from "@/components/EventFiles";
import ChatWidget from "@/components/ChatWidget";
import type { Profile, EventInfo, ChecklistItem, ChecklistProgress, ItineraryItem, EventFile, ChatMessage } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  // Fetch all data in parallel
  const [profileRes, eventRes, checklistRes, progressRes, itineraryRes, filesRes, chatRes] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("event_info").select("*").limit(1).single(),
      supabase.from("checklist_items").select("*").order("sort_order"),
      supabase.from("checklist_progress").select("*").eq("user_id", user.id),
      supabase.from("itinerary_items").select("*").order("sort_order").order("start_time"),
      supabase.from("event_files").select("*").order("uploaded_at", { ascending: false }),
      supabase.from("chat_messages").select("*").eq("user_id", user.id).order("created_at"),
    ]);

  const profile = profileRes.data as Profile;
  const event = eventRes.data as EventInfo | null;
  const checklistItems = (checklistRes.data || []) as ChecklistItem[];
  const checklistProgress = (progressRes.data || []) as ChecklistProgress[];
  const itineraryItems = (itineraryRes.data || []) as ItineraryItem[];
  const files = (filesRes.data || []) as EventFile[];
  const chatHistory = (chatRes.data || []) as ChatMessage[];

  return (
    <div className="min-h-screen bg-light-card">
      <Header profile={profile} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark-text">
            Welcome{profile.full_name ? `, ${profile.full_name}` : ""}!
          </h1>
          <p className="text-gray-500 mt-1">
            Here&apos;s everything you need for {event?.title || "the event"}.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            <DashboardChecklist
              items={checklistItems}
              progress={checklistProgress}
              userId={user.id}
            />
            <EventInfoCard event={event} />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <ItineraryTimeline items={itineraryItems} />
            <EventFiles files={files} />
          </div>
        </div>
      </main>

      <ChatWidget userId={user.id} initialMessages={chatHistory} />
    </div>
  );
}
