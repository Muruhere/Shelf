import { GoogleGenerativeAI } from "@google/generative-ai";

interface LLMProvider {
  generateSummary(notes: string, title: string): Promise<string>;
  generateFlashcards(
    notes: string,
    title: string
  ): Promise<{ question: string; answer: string }[]>;
}

class GeminiProvider implements LLMProvider {
  private genAI: GoogleGenerativeAI;
  private modelName = "gemini-2.5-flash";

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateSummary(notes: string, title: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: this.modelName });
    const prompt = `You are helping me retain what I've learned. Based on the notes below about "${title}", write a concise personal summary in the first person as if I'm explaining what I learned to myself. Keep it under 150 words. Be specific, not generic.

Notes:
${notes}

Summary:`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  }

  async generateFlashcards(
    notes: string,
    title: string
  ): Promise<{ question: string; answer: string }[]> {
    const model = this.genAI.getGenerativeModel({ model: this.modelName });
    const prompt = `Based on the notes below about "${title}", generate 5 to 10 flashcard question-answer pairs that will help me remember the key concepts.

Return ONLY a valid JSON array with no markdown, no code fences. Format:
[{"question": "...", "answer": "..."}, ...]

Notes:
${notes}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip markdown code fences if present
    const cleaned = text.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();
    const cards = JSON.parse(cleaned);

    if (!Array.isArray(cards)) throw new Error("LLM did not return an array");
    return cards.map((c: { question: string; answer: string }) => ({
      question: String(c.question),
      answer: String(c.answer),
    }));
  }
}

function getLLMProvider(): LLMProvider {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not set");
  return new GeminiProvider(apiKey);
}

export const llm = getLLMProvider;
