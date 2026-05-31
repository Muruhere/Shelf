// SM-2 spaced repetition algorithm
// quality: 1 = "Don't Know", 5 = "Know" (we use 2-point scale: 1 or 5)

interface SM2Result {
  interval: number;
  easeFactor: number;
  nextReviewAt: Date;
}

export function calculateNextReview(
  quality: "know" | "dont_know",
  currentInterval: number,
  currentEaseFactor: number,
  reviewCount: number
): SM2Result {
  const q = quality === "know" ? 5 : 1;

  let easeFactor = currentEaseFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  easeFactor = Math.max(1.3, easeFactor);

  let interval: number;
  if (q < 3) {
    // Forgot — reset
    interval = 1;
  } else if (reviewCount === 0) {
    interval = 1;
  } else if (reviewCount === 1) {
    interval = 6;
  } else {
    interval = Math.round(currentInterval * easeFactor);
  }

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + interval);
  nextReviewAt.setHours(0, 0, 0, 0);

  return { interval, easeFactor, nextReviewAt };
}
