"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ItineraryItem } from "@/lib/types";

const DEFAULT_SCHEDULE = [
  { date: "2026-04-16", start_time: "6:30 PM", end_time: null, title: "Welcome Dinner", sort_order: 0 },
  { date: "2026-04-16", start_time: "8:00 PM", end_time: null, title: "Opening Session + Hangout", sort_order: 1 },
  { date: "2026-04-17", start_time: "8:00 AM", end_time: null, title: "Breakfast & Coffee", sort_order: 2 },
  { date: "2026-04-17", start_time: "9:00 AM", end_time: "11:00 AM", title: "Session 1", sort_order: 3 },
  { date: "2026-04-17", start_time: "11:00 AM", end_time: "11:15 AM", title: "Break", sort_order: 4 },
  { date: "2026-04-17", start_time: "11:15 AM", end_time: "12:00 PM", title: "Session 2", sort_order: 5 },
  { date: "2026-04-17", start_time: "12:00 PM", end_time: "1:30 PM", title: "Lunch", sort_order: 6 },
  { date: "2026-04-17", start_time: "1:30 PM", end_time: "3:30 PM", title: "Session 3", sort_order: 7 },
  { date: "2026-04-17", start_time: "3:30 PM", end_time: "3:45 PM", title: "Break", sort_order: 8 },
  { date: "2026-04-17", start_time: "3:45 PM", end_time: "5:00 PM", title: "Live Build", sort_order: 9 },
  { date: "2026-04-17", start_time: "5:00 PM", end_time: "6:00 PM", title: "Personal Time / Enjoy the Airbnb", sort_order: 10 },
  { date: "2026-04-17", start_time: "6:00 PM", end_time: "7:30 PM", title: "Dinner", sort_order: 11 },
  { date: "2026-04-17", start_time: "7:30 PM", end_time: "9:00 PM", title: "Activities", sort_order: 12 },
  { date: "2026-04-18", start_time: "8:00 AM", end_time: "9:00 AM", title: "Breakfast", sort_order: 13 },
  { date: "2026-04-18", start_time: "9:00 AM", end_time: "12:30 PM", title: "Excursion / Activity", sort_order: 14 },
  { date: "2026-04-18", start_time: "12:30 PM", end_time: "2:00 PM", title: "Lunch", sort_order: 15 },
  { date: "2026-04-18", start_time: "2:00 PM", end_time: "4:00 PM", title: "Session", sort_order: 16 },
  { date: "2026-04-18", start_time: "4:00 PM", end_time: "4:15 PM", title: "Break", sort_order: 17 },
  { date: "2026-04-18", start_time: "4:15 PM", end_time: "5:00 PM", title: "Session", sort_order: 18 },
  { date: "2026-04-18", start_time: "5:00 PM", end_time: "5:45 PM", title: "Personal Reflection / Closing Session", sort_order: 19 },
  { date: "2026-04-18", start_time: "6:00 PM", end_time: "7:30 PM", title: "Dinner", sort_order: 20 },
  { date: "2026-04-18", start_time: "7:30 PM", end_time: "9:00 PM", title: "Party", sort_order: 21 },
  { date: "2026-04-19", start_time: "9:00 AM", end_time: null, title: "Breakfast / Event End", sort_order: 22 },
];

export default function AdminItineraryPage() {
  const supabase = createClient();
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [seeding, setSeeding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newForm, setNewForm] = useState({
    title: "",
    description: "",
    date: "",
    start_time: "",
    end_time: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    date: "",
    start_time: "",
    end_time: "",
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const { data } = await supabase
      .from("itinerary_items")
      .select("*")
      .order("sort_order")
      .order("start_time");
    if (data) setItems(data as ItineraryItem[]);
  };

  const seedDefaultSchedule = async () => {
    setSeeding(true);
    await supabase.from("itinerary_items").insert(DEFAULT_SCHEDULE);
    await loadItems();
    setSeeding(false);
  };

  const addItem = async () => {
    if (!newForm.title.trim()) return;
    const maxOrder = items.length > 0 ? Math.max(...items.map((i) => i.sort_order)) : -1;
    await supabase.from("itinerary_items").insert({
      title: newForm.title.trim(),
      description: newForm.description.trim() || null,
      date: newForm.date || null,
      start_time: newForm.start_time || null,
      end_time: newForm.end_time || null,
      sort_order: maxOrder + 1,
    });
    setNewForm({ title: "", description: "", date: "", start_time: "", end_time: "" });
    setShowAddForm(false);
    loadItems();
  };

  const startEdit = (item: ItineraryItem) => {
    setEditingId(item.id);
    setEditForm({
      title: item.title,
      description: item.description || "",
      date: item.date || "",
      start_time: item.start_time || "",
      end_time: item.end_time || "",
    });
  };

  const saveEdit = async () => {
    if (!editingId || !editForm.title.trim()) return;
    await supabase
      .from("itinerary_items")
      .update({
        title: editForm.title.trim(),
        description: editForm.description.trim() || null,
        date: editForm.date || null,
        start_time: editForm.start_time || null,
        end_time: editForm.end_time || null,
      })
      .eq("id", editingId);
    setEditingId(null);
    loadItems();
  };

  const deleteItem = async (id: string) => {
    await supabase.from("itinerary_items").delete().eq("id", id);
    loadItems();
  };

  const moveItem = async (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === items.length - 1)
    )
      return;
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    const current = items[index];
    const swap = items[swapIndex];
    await Promise.all([
      supabase.from("itinerary_items").update({ sort_order: swap.sort_order }).eq("id", current.id),
      supabase.from("itinerary_items").update({ sort_order: current.sort_order }).eq("id", swap.id),
    ]);
    loadItems();
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-dark-text">Manage Itinerary</h1>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-cyan text-white font-semibold px-5 py-2 rounded-lg uppercase tracking-wider text-sm hover:bg-cyan-hover transition-colors"
          >
            Add Item
          </button>
        )}
      </div>

      {/* Add new item form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-sm font-semibold text-dark-text uppercase tracking-wider mb-3">
            Add New Item
          </h2>
          <div className="space-y-3">
            <input
              type="text"
              value={newForm.title}
              onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
              placeholder="Title (e.g., Registration & Check-in)"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan text-dark-text"
            />
            <input
              type="text"
              value={newForm.description}
              onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
              placeholder="Description (optional)"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan text-dark-text"
            />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Date</label>
                <input
                  type="date"
                  value={newForm.date}
                  onChange={(e) => setNewForm({ ...newForm, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan text-dark-text text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                <input
                  type="text"
                  value={newForm.start_time}
                  onChange={(e) => setNewForm({ ...newForm, start_time: e.target.value })}
                  placeholder="9:00 AM"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan text-dark-text text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Time</label>
                <input
                  type="text"
                  value={newForm.end_time}
                  onChange={(e) => setNewForm({ ...newForm, end_time: e.target.value })}
                  placeholder="10:00 AM"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan text-dark-text text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addItem}
                disabled={!newForm.title.trim()}
                className="bg-cyan text-white font-semibold px-5 py-2 rounded-lg uppercase tracking-wider text-sm hover:bg-cyan-hover transition-colors disabled:opacity-50"
              >
                Add Item
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewForm({ title: "", description: "", date: "", start_time: "", end_time: "" });
                }}
                className="text-gray-500 px-5 py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Items list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-dark-text uppercase tracking-wider mb-3">
          Schedule ({items.length} items)
        </h2>

        {items.length === 0 ? (
          <div className="space-y-3">
            <p className="text-gray-400 text-sm">No itinerary items yet.</p>
            <button
              onClick={seedDefaultSchedule}
              disabled={seeding}
              className="bg-cyan text-white font-semibold px-5 py-2 rounded-lg uppercase tracking-wider text-sm hover:bg-cyan-hover transition-colors disabled:opacity-50"
            >
              {seeding ? "Importing..." : "Import Default Schedule"}
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li
                key={item.id}
                className="flex items-start gap-2 p-3 rounded-lg border border-gray-100"
              >
                {editingId === item.id ? (
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan text-dark-text"
                    />
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Description (optional)"
                      className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan text-dark-text"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Date</label>
                        <input
                          type="date"
                          value={editForm.date}
                          onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-cyan text-dark-text"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                        <input
                          type="text"
                          value={editForm.start_time}
                          onChange={(e) => setEditForm({ ...editForm, start_time: e.target.value })}
                          placeholder="9:00 AM"
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-cyan text-dark-text"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">End Time</label>
                        <input
                          type="text"
                          value={editForm.end_time}
                          onChange={(e) => setEditForm({ ...editForm, end_time: e.target.value })}
                          placeholder="10:00 AM"
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-cyan text-dark-text"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        disabled={!editForm.title.trim()}
                        className="text-xs bg-cyan text-white px-3 py-1.5 rounded font-medium hover:bg-cyan-hover transition-colors disabled:opacity-50"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs text-gray-500 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      <button
                        onClick={() => moveItem(index, "up")}
                        className="text-gray-300 hover:text-cyan text-xs"
                        disabled={index === 0}
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveItem(index, "down")}
                        className="text-gray-300 hover:text-cyan text-xs"
                        disabled={index === items.length - 1}
                      >
                        ▼
                      </button>
                    </div>

                    <div className="flex-1">
                      {(item.start_time || item.end_time) && (
                        <span className="text-xs font-medium text-cyan">
                          {item.start_time}
                          {item.end_time && ` – ${item.end_time}`}
                        </span>
                      )}
                      <p className="font-medium text-dark-text text-sm">{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-gray-500">{item.description}</p>
                      )}
                    </div>

                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => startEdit(item)}
                        className="text-xs text-gray-400 hover:text-cyan px-2 py-1 rounded hover:bg-gray-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded hover:bg-gray-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
