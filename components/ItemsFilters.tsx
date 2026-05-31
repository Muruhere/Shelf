"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";

interface Props {
  types: string[];
  statuses: string[];
  currentType: string;
  currentStatus: string;
  currentQ: string;
}

export default function ItemsFilters({
  types,
  statuses,
  currentType,
  currentStatus,
  currentQ,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(currentQ);

  function navigate(type: string, status: string, q: string) {
    const params = new URLSearchParams();
    if (type !== "all") params.set("type", type);
    if (status !== "all") params.set("status", status);
    if (q) params.set("q", q);
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate(currentType, currentStatus, query);
  }

  return (
    <div className={`space-y-3 transition-opacity ${isPending ? "opacity-60" : "opacity-100"}`}>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title or notes..."
          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
        >
          Search
        </button>
        {currentQ && (
          <button
            type="button"
            onClick={() => { setQuery(""); navigate(currentType, currentStatus, ""); }}
            className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
          >
            Clear
          </button>
        )}
      </form>

      <div className="flex gap-2 flex-wrap">
        <div className="flex gap-1 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => navigate(currentType, s, currentQ)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                currentStatus === s
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {s === "all" ? "All" : s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => navigate(t, currentStatus, currentQ)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                currentType === t
                  ? "bg-gray-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
