"use client";

import { useState } from "react";
import Link from "next/link";
import { FlipCard } from "./FlipCard";

interface Card {
  id: string;
  question: string;
  answer: string;
  item: { id: string; title: string; type: string };
}

interface Props {
  cards: Card[];
  backHref: string;
  title?: string;
}

export default function QuizSession({ cards: initialCards, backHref, title }: Props) {
  const [cards] = useState(initialCards);
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState({ know: 0, dontKnow: 0 });

  if (cards.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-white mb-2">All caught up!</h1>
        <p className="text-gray-400 mb-6">No cards due for review right now.</p>
        <Link href={backHref} className="text-blue-400 hover:text-blue-300">
          ← Back
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 space-y-4">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-white">Session complete!</h1>
        {title && <p className="text-gray-400 text-sm">{title}</p>}
        <p className="text-gray-400">
          {score.know} correct · {score.dontKnow} still learning
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <Link
            href={backHref}
            className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            {title ? "Back to item" : "Dashboard"}
          </Link>
          <button
            onClick={() => {
              setCurrent(0);
              setDone(false);
              setScore({ know: 0, dontKnow: 0 });
            }}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            Review again
          </button>
        </div>
      </div>
    );
  }

  async function handleReview(quality: "know" | "dont_know") {
    setSubmitting(true);
    await fetch(`/api/flashcards/${cards[current].id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quality }),
    });
    setScore((s) => ({
      ...s,
      [quality === "know" ? "know" : "dontKnow"]:
        s[quality === "know" ? "know" : "dontKnow"] + 1,
    }));
    if (current + 1 >= cards.length) {
      setDone(true);
    } else {
      setCurrent((c) => c + 1);
    }
    setSubmitting(false);
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-white truncate">
            {title ?? "Review session"}
          </h1>
          {!title && (
            <div className="text-xs text-gray-500 mt-0.5">
              From: <span className="text-gray-400">{cards[current].item.title}</span>
            </div>
          )}
        </div>
        <Link href={backHref} className="text-sm text-gray-500 hover:text-gray-300 flex-shrink-0 ml-3">
          Exit
        </Link>
      </div>
      <FlipCard
        question={cards[current].question}
        answer={cards[current].answer}
        cardNumber={current + 1}
        total={cards.length}
        onKnow={() => handleReview("know")}
        onDontKnow={() => handleReview("dont_know")}
        submitting={submitting}
      />
    </div>
  );
}
