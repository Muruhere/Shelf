"use client";

import { useState } from "react";

interface FlipCardProps {
  question: string;
  answer: string;
  cardNumber: number;
  total: number;
  onKnow: () => void;
  onDontKnow: () => void;
  submitting: boolean;
}

export function FlipCard({
  question,
  answer,
  cardNumber,
  total,
  onKnow,
  onDontKnow,
  submitting,
}: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  function handleKnow() {
    setFlipped(false);
    onKnow();
  }

  function handleDontKnow() {
    setFlipped(false);
    onDontKnow();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Card {cardNumber} of {total}</span>
        <span>{Math.round(((cardNumber - 1) / total) * 100)}% done</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-500"
          style={{ width: `${((cardNumber - 1) / total) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div
        className="relative cursor-pointer select-none"
        style={{ perspective: "1000px" }}
        onClick={() => setFlipped(!flipped)}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            minHeight: "240px",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-gray-900 border border-gray-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="text-xs font-medium text-gray-500 mb-4 uppercase tracking-wider">Question</div>
            <p className="text-lg text-white font-medium leading-relaxed">{question}</p>
            <p className="text-xs text-gray-600 mt-6">Tap to reveal answer</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-gray-800 border border-gray-600 rounded-2xl p-8 flex flex-col items-center justify-center text-center"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="text-xs font-medium text-blue-400 mb-4 uppercase tracking-wider">Answer</div>
            <p className="text-base text-gray-200 leading-relaxed">{answer}</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {flipped && (
        <div className="flex gap-4">
          <button
            onClick={handleDontKnow}
            disabled={submitting}
            className="flex-1 py-3 bg-red-900/40 hover:bg-red-900/60 border border-red-800 text-red-400 font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            Still learning
          </button>
          <button
            onClick={handleKnow}
            disabled={submitting}
            className="flex-1 py-3 bg-green-900/40 hover:bg-green-900/60 border border-green-800 text-green-400 font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            Got it
          </button>
        </div>
      )}

      {!flipped && (
        <div className="text-center text-xs text-gray-600">
          Tap the card to see the answer
        </div>
      )}
    </div>
  );
}
