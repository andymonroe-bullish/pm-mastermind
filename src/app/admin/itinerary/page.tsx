"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ItineraryItem } from "@/lib/types";

export default function AdminItineraryPage() {
  const supabase = createClient();
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
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

  const resetForm = () => {
    setForm({ title: "", description: "", date: "", start_time: "", end_time: "" });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return;

    if (editingId) {
      await supabase
        .from("itinerary_items")
        .update({
          title: form.title.trim(),
          description: form.description.trim() || null,
          date: form.date || null,
          start_time: form.start_time || null,
          end_time: form.end_time || null,
        })
        .eq("id", editingId);
    } else {
      const maxOrder = items.length > 0 ? Math.max(...items.map((i) => i.sort_order)) : -1;
      await supabase.from("itinerary_items").insert({
        title: form.title.trim(),
        description: form.description.trim() || null,
        date: form.date || null,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
        sort_order: maxOrder + 1,
      });
    }

    resetForm();
    loadItems();
  };

  const startEdit = (item: ItineraryItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description || "",
      date: item.date || "",
      start_time: item.start_time || "",
      end_time: item.end_time || "",
    });
    setShowForm(true);
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
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-cyan text-white font-semibold px-5 py-2 rounded-lg uppercase tracking-wider text-sm hover:bg-cyan-hover transition-colors"
          >
            Add Item
          </button>
        )}
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-sm font-semibold text-dark-text uppercase tracking-wider mb-3">
            {editingId ? "Edit Item" : "Add New Item"}
          </h2>
          <div className="space-y-3">
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Title (e.g., Registration & Check-in)"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan text-dark-text"
            />
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description (optional)"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan text-dark-text"
            />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan text-dark-text text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                <input
                  type="text"
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  placeholder="9:00 AM"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan text-dark-text text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Time</label>
                <input
                  type="text"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                  placeholder="10:00 AM"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan text-dark-text text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={!form.title.trim()}
                className="bg-cyan text-white font-semibold px-5 py-2 rounded-lg uppercase tracking-wider text-sm hover:bg-cyan-hover transition-colors disabled:opacity-50"
              >
                {editingId ? "Save Changes" : "Add Item"}
              </button>
              <button
                onClick={resetForm}
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
          <p className="text-gray-400 text-sm">No itinerary items yet.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li
                key={item.id}
                className="flex items-center gap-2 p-3 rounded-lg border border-gray-100 group"
              >
                <div className="flex flex-col gap-0.5">
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
                  <div className="flex items-center gap-2">
                    {(item.start_time || item.end_time) && (
                      <span className="text-xs font-medium text-cyan">
                        {item.start_time}
                        {item.end_time && ` – ${item.end_time}`}
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-dark-text text-sm">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-gray-500">{item.description}</p>
                  )}
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(item)}
                    className="text-xs text-gray-400 hover:text-cyan px-2 py-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="text-xs text-gray-400 hover:text-red-500 px-2 py-1"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
