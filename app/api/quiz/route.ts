import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const now = new Date();

  const cards = await prisma.flashcard.findMany({
    where: { nextReviewAt: { lte: now } },
    include: { item: { select: { id: true, title: true, type: true } } },
    orderBy: { nextReviewAt: "asc" },
  });

  return NextResponse.json(cards);
}
