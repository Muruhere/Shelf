import { prisma } from "@/lib/db";
import QuizSession from "@/components/QuizSession";

export const dynamic = "force-dynamic";

export default async function QuizAllPage() {
  const now = new Date();
  const cards = await prisma.flashcard.findMany({
    where: { nextReviewAt: { lte: now } },
    include: { item: { select: { id: true, title: true, type: true } } },
    orderBy: { nextReviewAt: "asc" },
  });

  return <QuizSession cards={cards} backHref="/" />;
}
