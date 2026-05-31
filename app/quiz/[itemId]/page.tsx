import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import QuizSession from "@/components/QuizSession";

export const dynamic = "force-dynamic";

export default async function ItemQuizPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = await params;
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: { flashcards: { orderBy: { nextReviewAt: "asc" } } },
  });

  if (!item) notFound();

  const cards = item.flashcards.map((f) => ({
    ...f,
    item: { id: item.id, title: item.title, type: item.type },
  }));

  return <QuizSession cards={cards} backHref={`/items/${itemId}`} title={item.title} />;
}
