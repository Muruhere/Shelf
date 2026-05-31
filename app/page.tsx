import Link from "next/link";
import { prisma } from "@/lib/db";
import { ItemCard } from "@/components/ItemCard";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const now = new Date();

  const [dueCards, recentItems, stats] = await Promise.all([
    prisma.flashcard.findMany({
      where: { nextReviewAt: { lte: now } },
      include: { item: { select: { id: true, title: true, type: true } } },
      orderBy: { nextReviewAt: "asc" },
    }),
    prisma.item.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { _count: { select: { flashcards: true } } },
    }),
    prisma.item.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const totalItems = stats.reduce((sum, s) => sum + s._count, 0);
  const inboxCount = stats.find((s) => s.status === "inbox")?._count ?? 0;

  const dueByItem = dueCards.reduce<
    Record<string, { title: string; type: string; count: number; itemId: string }>
  >((acc, card) => {
    if (!acc[card.item.id]) {
      acc[card.item.id] = {
        title: card.item.title,
        type: card.item.type,
        count: 0,
        itemId: card.item.id,
      };
    }
    acc[card.item.id].count++;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="text-2xl font-bold text-white">{totalItems}</div>
          <div className="text-sm text-gray-400 mt-1">Items saved</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="text-2xl font-bold text-amber-400">{inboxCount}</div>
          <div className="text-sm text-gray-400 mt-1">In inbox</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="text-2xl font-bold text-blue-400">{dueCards.length}</div>
          <div className="text-sm text-gray-400 mt-1">Cards due today</div>
        </div>
      </div>

      {/* Due for review */}
      {dueCards.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Due for review</h2>
            <Link
              href="/quiz"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Start quiz
            </Link>
          </div>
          <div className="space-y-2">
            {Object.values(dueByItem).map(({ itemId, title, type, count }) => (
              <div
                key={itemId}
                className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{typeEmoji(type)}</span>
                  <div>
                    <div className="text-sm font-medium text-white">{title}</div>
                    <div className="text-xs text-gray-500">
                      {count} card{count !== 1 ? "s" : ""} due
                    </div>
                  </div>
                </div>
                <Link
                  href={`/quiz/${itemId}`}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Review →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent items */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent</h2>
          <Link
            href="/items"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            View all →
          </Link>
        </div>
        {recentItems.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-medium text-gray-400">Nothing saved yet</p>
            <p className="text-sm mt-1">
              <Link href="/add" className="text-blue-400 hover:text-blue-300">
                Add your first item
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function typeEmoji(type: string): string {
  const map: Record<string, string> = {
    youtube: "▶️",
    article: "📄",
    instagram: "📸",
    podcast: "🎙️",
    book: "📖",
    screenshot: "🖼️",
    note: "📝",
  };
  return map[type] ?? "📌";
}
