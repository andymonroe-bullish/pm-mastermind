"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChecklistItem } from "@/lib/types";

export default function AdminChecklistPage() {
  const supabase = createClient();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const { data } = await supabase
      .from("checklist_items")
      .select("*")
      .order("sort_order");
    if (data) setItems(data as ChecklistItem[]);
  };

  const addItem = async () => {
    if (!newTitle.trim()) return;

    const maxOrder = items.length > 0 ? Math.max(...items.map((i) => i.sort_order)) : -1;

    await supabase.from("checklist_items").insert({
      title: newTitle.trim(),
      description: newDescription.trim() || null,
      sort_order: maxOrder + 1,
    });

    setNewTitle("");
    setNewDescription("");
    loadItems();
  };

  const deleteItem = async (id: string) => {
    await supabase.from("checklist_items").delete().eq("id", id);
    loadItems();
  };

  const startEdit = (item: ChecklistItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditDescription(item.description || "");
  };

  const saveEdit = async () => {
    if (!editingId || !editTitle.trim()) return;

    await supabase
      .from("checklist_items")
      .update({
        title: editTitle.trim(),
        description: editDescription.trim() || null,
      })
      .eq("id", editingId);

    setEditingId(null);
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
      supabase.from("checklist_items").update({ sort_order: swap.sort_order }).eq("id", current.id),
      supabase.from("checklist_items").update({ sort_order: current.sort_order }).eq("id", swap.id),
    ]);

    loadItems();
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-dark-text mb-6">Manage Checklist</h1>

      {/* Add new item */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-dark-text uppercase tracking-wider mb-3">
          Add New Item
        </h2>
        <div className="space-y-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Checklist item title"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan text-dark-text"
            onKeyDown={(e) => e.key === "Enter" && addItem()}
          />
          <input
            type="text"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan text-dark-text"
          />
          <button
            onClick={addItem}
            disabled={!newTitle.trim()}
            className="bg-cyan text-white font-semibold px-5 py-2 rounded-lg uppercase tracking-wider text-sm hover:bg-cyan-hover transition-colors disabled:opacity-50"
          >
            Add Item
          </button>
        </div>
      </div>

      {/* Items list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-dark-text uppercase tracking-wider mb-3">
          Checklist Items ({items.length})
        </h2>

        {items.length === 0 ? (
          <p className="text-gray-400 text-sm">No checklist items yet.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li
                key={item.id}
                className="flex items-center gap-2 p-3 rounded-lg border border-gray-100 group"
              >
                {editingId === item.id ? (
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan text-dark-text"
                    />
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description (optional)"
                      className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan text-dark-text"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="text-xs bg-cyan text-white px-3 py-1 rounded font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs text-gray-500 px-3 py-1 rounded hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Reorder buttons */}
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
