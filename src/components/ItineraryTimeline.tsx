"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ItineraryItem } from "@/lib/types";

function formatDateHeading(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  const day = d.getDate();
  const suffix =
    day === 1 || day === 21 || day === 31
      ? "st"
      : day === 2 || day === 22
      ? "nd"
      : day === 3 || day === 23
      ? "rd"
      : "th";
  return {
    label: d.toLocaleDateString("en-US", { weekday: "long" }),
    shortLabel: d.toLocaleDateString("en-US", { weekday: "short" }),
    dateLabel: `${d.toLocaleDateString("en-US", { month: "long" })} ${day}${suffix}`,
  };
}

export default function ItineraryTimeline() {
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("itinerary_items")
        .select("*")
        .order("sort_order")
        .order("start_time");
      setItems((data || []) as ItineraryItem[]);
      setLoading(false);
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Group by date
  const groupMap: Record<string, ItineraryItem[]> = {};
  for (const item of items) {
    const key = item.date || "tbd";
    if (!groupMap[key]) groupMap[key] = [];
    groupMap[key].push(item);
  }
  const days = Object.entries(groupMap).map(([date, dayItems]) => ({
    date,
    ...(date !== "tbd" ? formatDateHeading(date) : { label: "TBD", shortLabel: "TBD", dateLabel: "Date TBD" }),
    items: dayItems,
  }));

  // Set default active day once items load
  useEffect(() => {
    if (days.length > 0 && activeDay === null) {
      setActiveDay(days[0].date);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const currentDay = days.find((d) => d.date === activeDay) ?? days[0];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
      <h2 className="text-base sm:text-lg font-bold text-dark-text uppercase tracking-wider mb-4 relative">
        <span className="relative z-10">Schedule</span>
        <span className="absolute bottom-0 left-0 h-2 w-20 sm:w-24 bg-cyan/20 -z-0" />
      </h2>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading schedule...</p>
      ) : days.length === 0 ? (
        <p className="text-gray-400 text-sm">Schedule coming soon.</p>
      ) : (
        <>
          {/* Day toggle buttons */}
          <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-1">
            {days.map((day) => (
              <button
                key={day.date}
                onClick={() => setActiveDay(day.date)}
                className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex-1 min-w-0 ${
                  activeDay === day.date
                    ? "bg-cyan text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span className="block sm:hidden">{day.shortLabel}</span>
                <span className="hidden sm:block">{day.label}</span>
                <span
                  className={`block text-[10px] sm:text-xs ${
                    activeDay === day.date ? "text-white/80" : "text-gray-400"
                  }`}
                >
                  {day.dateLabel}
                </span>
              </button>
            ))}
          </div>

          {/* Timeline */}
          <div className="space-y-0">
            {currentDay?.items.map((item, index) => (
              <div key={item.id} className="flex gap-2.5 sm:gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-cyan flex-shrink-0 mt-1.5" />
                  {index < (currentDay.items.length - 1) && (
                    <div className="w-0.5 bg-cyan/20 flex-1 min-h-[1.5rem] sm:min-h-[2rem]" />
                  )}
                </div>
                <div className="pb-4 sm:pb-5">
                  <span className="text-[10px] sm:text-xs font-semibold text-cyan bg-cyan/10 px-1.5 py-0.5 sm:px-2 rounded">
                    {item.start_time}
                    {item.end_time && ` – ${item.end_time}`}
                  </span>
                  <p className="text-sm sm:text-base font-semibold text-dark-text mt-1">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
