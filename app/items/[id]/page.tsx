import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ItemDetail from "@/components/ItemDetail";

export const dynamic = "force-dynamic";

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await prisma.item.findUnique({
    where: { id },
    include: { flashcards: { orderBy: { nextReviewAt: "asc" } } },
  });

  if (!item) notFound();

  return <ItemDetail item={item} />;
}
