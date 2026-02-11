"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChecklistItem, ChecklistProgress } from "@/lib/types";

interface Props {
  items: ChecklistItem[];
  progress: ChecklistProgress[];
  userId: string;
}

export default function DashboardChecklist({ items, progress, userId }: Props) {
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    progress.forEach((p) => {
      if (p.completed) map[p.item_id] = true;
    });
    return map;
  });
  const [loading, setLoading] = useState<string | null>(null);
  const supabase = createClient();

  const completedCount = Object.values(completedMap).filter(Boolean).length;
  const percentage = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const toggleItem = async (itemId: string) => {
    const wasCompleted = completedMap[itemId];
    setLoading(itemId);

    // Optimistic update
    setCompletedMap((prev) => ({ ...prev, [itemId]: !wasCompleted }));

    try {
      if (wasCompleted) {
        await supabase
          .from("checklist_progress")
          .delete()
          .eq("user_id", userId)
          .eq("item_id", itemId);
      } else {
        await supabase.from("checklist_progress").upsert({
          user_id: userId,
          item_id: itemId,
          completed: true,
          completed_at: new Date().toISOString(),
        });
      }
    } catch {
      // Revert on error
      setCompletedMap((prev) => ({ ...prev, [itemId]: wasCompleted }));
    } finally {
      setLoading(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-dark-text uppercase tracking-wider mb-4 relative">
          <span className="relative z-10">Pre-Event Checklist</span>
          <span className="absolute bottom-0 left-0 h-2 w-44 bg-cyan/20 -z-0" />
        </h2>
        <p className="text-gray-400 text-sm">No checklist items yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-dark-text uppercase tracking-wider mb-4 relative">
        <span className="relative z-10">Pre-Event Checklist</span>
        <span className="absolute bottom-0 left-0 h-2 w-44 bg-cyan/20 -z-0" />
      </h2>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-500">
            {completedCount} of {items.length} completed
          </span>
          <span className="font-semibold text-cyan">{percentage}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className="bg-cyan h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Items */}
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <button
              onClick={() => toggleItem(item.id)}
              disabled={loading === item.id}
              className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                completedMap[item.id]
                  ? "bg-cyan border-cyan text-white"
                  : "border-gray-300 hover:border-cyan"
              }`}
            >
              {completedMap[item.id] && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <div>
              <p
                className={`font-medium text-dark-text ${
                  completedMap[item.id] ? "line-through text-gray-400" : ""
                }`}
              >
                {item.title}
              </p>
              {item.description && (
                <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
