import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateNextReview } from "@/lib/spaced-repetition";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { quality } = await request.json() as { quality: "know" | "dont_know" };

  const card = await prisma.flashcard.findUnique({ where: { id } });
  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { interval, easeFactor, nextReviewAt } = calculateNextReview(
    quality,
    card.interval,
    card.easeFactor,
    card.reviewCount
  );

  const updated = await prisma.flashcard.update({
    where: { id },
    data: {
      interval,
      easeFactor,
      nextReviewAt,
      lastReviewedAt: new Date(),
      reviewCount: { increment: 1 },
    },
  });

  return NextResponse.json(updated);
}
