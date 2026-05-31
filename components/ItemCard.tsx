import Link from "next/link";

const typeEmoji: Record<string, string> = {
  youtube: "▶️",
  article: "📄",
  instagram: "📸",
  podcast: "🎙️",
  book: "📖",
  screenshot: "🖼️",
  note: "📝",
};

const statusColor: Record<string, string> = {
  inbox: "bg-amber-900/40 text-amber-400 border-amber-800",
  in_progress: "bg-blue-900/40 text-blue-400 border-blue-800",
  done: "bg-green-900/40 text-green-400 border-green-800",
};

const statusLabel: Record<string, string> = {
  inbox: "Inbox",
  in_progress: "In Progress",
  done: "Done",
};

interface ItemCardProps {
  item: {
    id: string;
    type: string;
    title: string;
    url?: string | null;
    status: string;
    createdAt: Date;
    summary?: string | null;
    _count?: { flashcards: number };
  };
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Link href={`/items/${item.id}`}>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition-colors cursor-pointer h-full flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base flex-shrink-0">{typeEmoji[item.type] ?? "📌"}</span>
            <h3 className="font-medium text-white text-sm leading-snug line-clamp-2">
              {item.title}
            </h3>
          </div>
        </div>

        {item.summary && (
          <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">{item.summary}</p>
        )}

        <div className="flex items-center gap-2 mt-auto">
          <span
            className={`text-xs px-2 py-0.5 rounded-full border ${statusColor[item.status] ?? ""}`}
          >
            {statusLabel[item.status] ?? item.status}
          </span>
          {(item._count?.flashcards ?? 0) > 0 && (
            <span className="text-xs text-gray-500">
              {item._count!.flashcards} card{item._count!.flashcards !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
