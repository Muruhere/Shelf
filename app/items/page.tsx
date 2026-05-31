import { prisma } from "@/lib/db";
import Link from "next/link";
import { ItemCard } from "@/components/ItemCard";
import ItemsFilters from "@/components/ItemsFilters";

export const dynamic = "force-dynamic";

const TYPES = ["all", "youtube", "article", "instagram", "podcast", "book", "screenshot", "note"];
const STATUSES = ["all", "inbox", "in_progress", "done"];

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; q?: string }>;
}) {
  const { type, status, q } = await searchParams;

  const items = await prisma.item.findMany({
    where: {
      ...(status && status !== "all" ? { status } : {}),
      ...(type && type !== "all" ? { type } : {}),
      ...(q
        ? { OR: [{ title: { contains: q } }, { notes: { contains: q } }] }
        : {}),
    },
    include: { _count: { select: { flashcards: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Library</h1>
        <Link
          href="/add"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add item
        </Link>
      </div>

      <ItemsFilters
        types={TYPES}
        statuses={STATUSES}
        currentType={type ?? "all"}
        currentStatus={status ?? "all"}
        currentQ={q ?? ""}
      />

      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-medium text-gray-400">No items found</p>
          <p className="text-sm mt-1">
            Try different filters or{" "}
            <Link href="/add" className="text-blue-400 hover:text-blue-300">
              add something new
            </Link>
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
