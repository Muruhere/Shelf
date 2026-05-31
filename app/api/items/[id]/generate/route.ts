import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { llm } from "@/lib/llm";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = await prisma.item.findUnique({ where: { id } });

  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!item.notes || item.notes.trim().length < 10) {
    return NextResponse.json(
      { error: "Add some notes first (at least 10 characters)" },
      { status: 400 }
    );
  }

  const provider = llm();

  const [summary, flashcardData] = await Promise.all([
    provider.generateSummary(item.notes, item.title),
    provider.generateFlashcards(item.notes, item.title),
  ]);

  // Delete existing flashcards and replace
  await prisma.flashcard.deleteMany({ where: { itemId: id } });

  const [updatedItem] = await Promise.all([
    prisma.item.update({
      where: { id },
      data: { summary },
      include: { flashcards: true },
    }),
    prisma.flashcard.createMany({
      data: flashcardData.map((c) => ({
        itemId: id,
        question: c.question,
        answer: c.answer,
      })),
    }),
  ]);

  const finalItem = await prisma.item.findUnique({
    where: { id },
    include: { flashcards: true },
  });

  return NextResponse.json(finalItem);
}
