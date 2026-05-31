import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const q = searchParams.get("q");

  const items = await prisma.item.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(type ? { type } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { notes: { contains: q } },
            ],
          }
        : {}),
    },
    include: {
      _count: { select: { flashcards: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type, title, url, notes, imageUrl } = body;

  if (!type || !title) {
    return NextResponse.json({ error: "type and title are required" }, { status: 400 });
  }

  const item = await prisma.item.create({
    data: { type, title, url, notes: notes ?? "", imageUrl },
  });

  return NextResponse.json(item, { status: 201 });
}
