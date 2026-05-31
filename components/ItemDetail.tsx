"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Item, Flashcard } from "@prisma/client";

type ItemWithFlashcards = Item & { flashcards: Flashcard[] };

const STATUS_OPTIONS = [
  { value: "inbox", label: "Inbox" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

const typeEmoji: Record<string, string> = {
  youtube: "▶️",
  article: "📄",
  instagram: "📸",
  podcast: "🎙️",
  book: "📖",
  screenshot: "🖼️",
  note: "📝",
};

export default function ItemDetail({ item: initialItem }: { item: ItemWithFlashcards }) {
  const router = useRouter();
  const [item, setItem] = useState(initialItem);
  const [notes, setNotes] = useState(initialItem.notes);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  async function saveNotes() {
    setSaving(true);
    await fetch(`/api/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    setItem((prev) => ({ ...prev, notes }));
    setSaving(false);
  }

  async function updateStatus(status: string) {
    await fetch(`/api/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setItem((prev) => ({ ...prev, status }));
  }

  async function generate() {
    setGenerating(true);
    setGenerateError("");
    await fetch(`/api/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    const res = await fetch(`/api/items/${item.id}/generate`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setItem(data);
      setNotes(data.notes);
    } else {
      const err = await res.json();
      setGenerateError(err.error ?? "Generation failed");
    }
    setGenerating(false);
  }

  async function deleteItem() {
    if (!confirm("Delete this item and all its flashcards?")) return;
    setDeleting(true);
    await fetch(`/api/items/${item.id}`, { method: "DELETE" });
    router.push("/items");
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <span className="text-2xl flex-shrink-0 mt-0.5">{typeEmoji[item.type] ?? "📌"}</span>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-white leading-tight">{item.title}</h1>
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300 truncate block mt-1"
              >
                {item.url}
              </a>
            )}
          </div>
        </div>
        <button
          onClick={deleteItem}
          disabled={deleting}
          className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0 text-sm"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      {/* Status + quiz link */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateStatus(opt.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                item.status === opt.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {item.flashcards.length > 0 && (
          <Link
            href={`/quiz/${item.id}`}
            className="px-3 py-1 text-xs font-medium bg-green-900/40 text-green-400 border border-green-800 rounded-full hover:bg-green-900/60 transition-colors"
          >
            Quiz ({item.flashcards.length} cards)
          </Link>
        )}
      </div>

      {/* Screenshot preview */}
      {item.imageUrl && (
        <div className="rounded-xl overflow-hidden border border-gray-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt="Screenshot"
            className="w-full max-h-80 object-contain bg-gray-900"
          />
        </div>
      )}

      {/* Notes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">Notes</label>
          <button
            onClick={saveNotes}
            disabled={saving || notes === item.notes}
            className="text-xs text-blue-400 hover:text-blue-300 disabled:text-gray-600 transition-colors"
          >
            {saving ? "Saving..." : notes === item.notes ? "Saved" : "Save notes"}
          </button>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add your notes here. The more detail, the better the flashcards and summary will be."
          rows={8}
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-600 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Generate */}
      <div className="space-y-2">
        <button
          onClick={generate}
          disabled={generating || notes.trim().length < 10}
          className="w-full py-2.5 bg-purple-700 hover:bg-purple-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
        >
          {generating ? "Generating with Gemini..." : "✨ Generate summary + flashcards"}
        </button>
        {generateError && <p className="text-red-400 text-sm">{generateError}</p>}
        {notes.trim().length < 10 && (
          <p className="text-gray-600 text-xs text-center">Add at least 10 characters of notes to generate</p>
        )}
      </div>

      {/* Summary */}
      {item.summary && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-2">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Summary</h2>
          <p className="text-gray-300 text-sm leading-relaxed">{item.summary}</p>
        </div>
      )}

      {/* Flashcards */}
      {item.flashcards.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
            Flashcards ({item.flashcards.length})
          </h2>
          {item.flashcards.map((card) => (
            <div
              key={card.id}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
            >
              <button
                className="w-full text-left px-5 py-4 flex items-start justify-between gap-3"
                onClick={() => setExpandedCard(expandedCard === card.id ? null : card.id)}
              >
                <span className="text-sm text-white">{card.question}</span>
                <span className="text-gray-500 text-sm flex-shrink-0">
                  {expandedCard === card.id ? "▲" : "▼"}
                </span>
              </button>
              {expandedCard === card.id && (
                <div className="px-5 pb-4 border-t border-gray-800 pt-4">
                  <p className="text-sm text-gray-300 leading-relaxed">{card.answer}</p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-gray-600">
                    <span>Interval: {card.interval}d</span>
                    <span>Reviews: {card.reviewCount}</span>
                    <span>Next: {new Date(card.nextReviewAt).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
