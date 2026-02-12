"use client";

import { useState } from "react";
import DashboardChecklist from "@/components/DashboardChecklist";
import EventInfoCard from "@/components/EventInfoCard";
import ItineraryTimeline from "@/components/ItineraryTimeline";
import EventFiles from "@/components/EventFiles";
import type { EventInfo, ChecklistItem, ChecklistProgress, EventFile } from "@/lib/types";

const tabs = [
  { id: "checklist", label: "Checklist" },
  { id: "details", label: "Event Details" },
  { id: "schedule", label: "Schedule" },
  { id: "files", label: "Files" },
] as const;

type TabId = (typeof tabs)[number]["id"];

interface DashboardTabsProps {
  event: EventInfo | null;
  checklistItems: ChecklistItem[];
  checklistProgress: ChecklistProgress[];
  files: EventFile[];
  userId: string;
}

export default function DashboardTabs({
  event,
  checklistItems,
  checklistProgress,
  files,
  userId,
}: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("checklist");

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-0 sm:gap-1 border-b border-gray-200 mb-4 sm:mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-3 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "text-cyan border-b-2 border-cyan"
                : "text-gray-500 hover:text-dark-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "checklist" && (
          <DashboardChecklist
            items={checklistItems}
            progress={checklistProgress}
            userId={userId}
          />
        )}
        {activeTab === "details" && <EventInfoCard event={event} />}
        {activeTab === "schedule" && <ItineraryTimeline />}
        {activeTab === "files" && <EventFiles files={files} />}
      </div>
    </div>
  );
}
