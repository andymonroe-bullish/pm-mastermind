"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { EventInfo } from "@/lib/types";

export default function AdminEventInfoPage() {
  const supabase = createClient();
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("event_info").select("*").limit(1).single();
      if (data) setEvent(data as EventInfo);
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!event) return;
    setSaving(true);
    setSaved(false);

    await supabase
      .from("event_info")
      .update({
        title: event.title,
        event_date: event.event_date || null,
        event_time: event.event_time || null,
        location: event.location || null,
        venue_name: event.venue_name || null,
        description: event.description || null,
        additional_notes: event.additional_notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", event.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!event) {
    return <div className="text-gray-400">Loading...</div>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-dark-text mb-6">Event Information</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-dark-text mb-1">Event Title</label>
          <input
            type="text"
            value={event.title}
            onChange={(e) => setEvent({ ...event, title: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan text-dark-text"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-text mb-1">Date</label>
            <input
              type="date"
              value={event.event_date || ""}
              onChange={(e) => setEvent({ ...event, event_date: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan text-dark-text"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-text mb-1">Time</label>
            <input
              type="text"
              value={event.event_time || ""}
              onChange={(e) => setEvent({ ...event, event_time: e.target.value })}
              placeholder="e.g., 9:00 AM - 5:00 PM"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan text-dark-text"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-text mb-1">Venue Name</label>
          <input
            type="text"
            value={event.venue_name || ""}
            onChange={(e) => setEvent({ ...event, venue_name: e.target.value })}
            placeholder="e.g., The Grand Ballroom"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan text-dark-text"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-text mb-1">Location</label>
          <input
            type="text"
            value={event.location || ""}
            onChange={(e) => setEvent({ ...event, location: e.target.value })}
            placeholder="e.g., 123 Main St, City, State"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan text-dark-text"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-text mb-1">Description</label>
          <textarea
            value={event.description || ""}
            onChange={(e) => setEvent({ ...event, description: e.target.value })}
            rows={4}
            placeholder="Event description..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan text-dark-text resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-text mb-1">Additional Notes</label>
          <textarea
            value={event.additional_notes || ""}
            onChange={(e) => setEvent({ ...event, additional_notes: e.target.value })}
            rows={3}
            placeholder="Any additional notes for attendees..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan text-dark-text resize-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-cyan text-white font-semibold px-6 py-2.5 rounded-lg uppercase tracking-wider hover:bg-cyan-hover transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {saved && <span className="text-green-500 text-sm font-medium">Saved!</span>}
        </div>
      </div>
    </div>
  );
}
